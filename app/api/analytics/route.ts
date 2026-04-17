import { getCategoryMap } from "@/lib/category-map";
import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import { toDateKey } from "@/lib/utils";
import Transaction from "@/models/Transaction";
import {
  endOfMonth,
  getDaysInMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const thirtyDaysAgo = subDays(now, 30);

  const [thisMonthTx, lastMonthTx, last30DaysTx, categoryMap] =
    await Promise.all([
      Transaction.find({
        userId,
        date: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }).lean(),
      Transaction.find({
        userId,
        date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }).lean(),
      Transaction.find({
        userId,
        date: { $gte: thirtyDaysAgo, $lte: now },
      }).lean(),
      getCategoryMap(userId),
    ]);

  // Daily spending (last 30 days)
  const dailyMap = new Map<string, { income: number; expense: number }>();
  for (const tx of last30DaysTx) {
    const key = toDateKey(tx.date);
    const entry = dailyMap.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
    dailyMap.set(key, entry);
  }

  const dailySpending = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(now, i);
    const key = toDateKey(date);
    const entry = dailyMap.get(key) ?? { income: 0, expense: 0 };
    dailySpending.push({ date: key, ...entry });
  }

  // Category totals
  const thisMonthCats = new Map<string, number>();
  const lastMonthCats = new Map<string, number>();
  let thisMonthIncome = 0,
    thisMonthExpense = 0;
  let lastMonthIncome = 0,
    lastMonthExpense = 0;

  for (const tx of thisMonthTx) {
    if (tx.type === "expense") {
      thisMonthCats.set(
        tx.category,
        (thisMonthCats.get(tx.category) ?? 0) + tx.amount
      );
      thisMonthExpense += tx.amount;
    } else {
      thisMonthIncome += tx.amount;
    }
  }

  for (const tx of lastMonthTx) {
    if (tx.type === "expense") {
      lastMonthCats.set(
        tx.category,
        (lastMonthCats.get(tx.category) ?? 0) + tx.amount
      );
      lastMonthExpense += tx.amount;
    } else {
      lastMonthIncome += tx.amount;
    }
  }

  // Category comparison
  const allCategories = new Set([
    ...thisMonthCats.keys(),
    ...lastMonthCats.keys(),
  ]);
  const categoryComparison = [...allCategories]
    .map((cat) => {
      const thisMonth = thisMonthCats.get(cat) ?? 0;
      const lastMonth = lastMonthCats.get(cat) ?? 0;
      const change =
        lastMonth > 0
          ? ((thisMonth - lastMonth) / lastMonth) * 100
          : thisMonth > 0
            ? 100
            : 0;
      return {
        category: cat,
        thisMonth,
        lastMonth,
        change: Math.round(change),
        color: categoryMap.get(cat)?.color ?? "#64748b",
      };
    })
    .sort((a, b) => b.thisMonth - a.thisMonth);

  // Insights
  const insights: { type: "warning" | "success" | "info"; message: string }[] =
    [];

  const dayOfMonth = now.getDate();
  const daysInMonth = getDaysInMonth(now);
  const avgDailySpend = dayOfMonth > 0 ? thisMonthExpense / dayOfMonth : 0;
  const projectedMonthlySpend = avgDailySpend * daysInMonth;

  if (
    lastMonthExpense > 0 &&
    thisMonthExpense > lastMonthExpense * 0.8 &&
    dayOfMonth < daysInMonth * 0.7
  ) {
    insights.push({
      type: "warning",
      message: `You've already spent ${Math.round((thisMonthExpense / lastMonthExpense) * 100)}% of last month's total with ${daysInMonth - dayOfMonth} days remaining.`,
    });
  }

  if (thisMonthIncome > thisMonthExpense && thisMonthIncome > 0) {
    const rate = (
      ((thisMonthIncome - thisMonthExpense) / thisMonthIncome) *
      100
    ).toFixed(0);
    insights.push({
      type: "success",
      message: `Great job! Your savings rate this month is ${rate}%.`,
    });
  }

  for (const [cat, amount] of thisMonthCats) {
    const lastAmount = lastMonthCats.get(cat) ?? 0;
    if (lastAmount > 0 && amount > lastAmount * 1.3) {
      insights.push({
        type: "warning",
        message: `${cat} spending is up ${Math.round(((amount - lastAmount) / lastAmount) * 100)}% compared to last month.`,
      });
    }
  }

  if (projectedMonthlySpend > 0 && lastMonthExpense > 0) {
    insights.push({
      type: "info",
      message: `At your current pace, you'll spend ~${Math.round(projectedMonthlySpend).toLocaleString()} this month (last month: ${Math.round(lastMonthExpense).toLocaleString()}).`,
    });
  }

  if (avgDailySpend > 0) {
    insights.push({
      type: "info",
      message: `Your average daily spending this month is ${Math.round(avgDailySpend).toLocaleString()}.`,
    });
  }

  // Top category
  let topCategory: { name: string; amount: number } | null = null;
  if (thisMonthCats.size > 0) {
    const sorted = [...thisMonthCats.entries()].sort((a, b) => b[1] - a[1]);
    topCategory = { name: sorted[0][0], amount: sorted[0][1] };
  }

  return NextResponse.json({
    dailySpending,
    categoryComparison,
    monthComparison: {
      thisMonth: { income: thisMonthIncome, expense: thisMonthExpense },
      lastMonth: { income: lastMonthIncome, expense: lastMonthExpense },
    },
    insights,
    avgDailySpend: Math.round(avgDailySpend),
    projectedMonthlySpend: Math.round(projectedMonthlySpend),
    topCategory,
  });
}

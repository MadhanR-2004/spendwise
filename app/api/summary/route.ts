import { getCategoryMap } from "@/lib/category-map";
import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import { toDateKey } from "@/lib/utils";
import Transaction from "@/models/Transaction";
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, subWeeks } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const heatmapStart = startOfWeek(subWeeks(now, 11), { weekStartsOn: 0 });
  const heatmapEnd = endOfWeek(now, { weekStartsOn: 0 });

  const [monthTransactions, heatmapTransactions, recentTransactions, categoryMap] = await Promise.all([
    Transaction.find({ userId, date: { $gte: monthStart, $lte: monthEnd } }).lean(),
    Transaction.find({ userId, date: { $gte: heatmapStart, $lte: heatmapEnd } }).lean(),
    Transaction.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(10).lean(),
    getCategoryMap(userId),
  ]);

  const totals = monthTransactions.reduce(
    (acc, item) => {
      if (item.type === "income") acc.income += item.amount;
      else acc.expense += item.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;
  const savingsRate = totals.income > 0 ? (net / totals.income) * 100 : 0;

  const expenseMap = new Map<string, number>();
  const incomeMap = new Map<string, number>();
  const monthCategoryTotalsMap = new Map<string, number>();

  for (const transaction of monthTransactions) {
    if (transaction.type === "expense") {
      expenseMap.set(transaction.category, (expenseMap.get(transaction.category) ?? 0) + transaction.amount);
      monthCategoryTotalsMap.set(
        transaction.category,
        (monthCategoryTotalsMap.get(transaction.category) ?? 0) + transaction.amount
      );
    } else {
      incomeMap.set(transaction.category, (incomeMap.get(transaction.category) ?? 0) + transaction.amount);
    }
  }

  const expenseByCategory = [...expenseMap.entries()].map(([name, value]) => ({
    name,
    value,
    color: categoryMap.get(name)?.color ?? "#64748b",
  }));

  const incomeByCategory = [...incomeMap.entries()].map(([name, value]) => ({
    name,
    value,
    color: categoryMap.get(name)?.color ?? "#64748b",
  }));

  const monthCategoryTotals = [...monthCategoryTotalsMap.entries()]
    .map(([category, total]) => ({
      category,
      total,
      color: categoryMap.get(category)?.color ?? "#64748b",
    }))
    .sort((a, b) => b.total - a.total);

  const daySpendMap = new Map<string, number>();
  const dailyTransactions: Record<string, typeof heatmapTransactions> = {};

  for (const transaction of heatmapTransactions) {
    const key = toDateKey(transaction.date);
    const spend = transaction.type === "expense" ? transaction.amount : 0;
    daySpendMap.set(key, (daySpendMap.get(key) ?? 0) + spend);

    if (!dailyTransactions[key]) dailyTransactions[key] = [];
    dailyTransactions[key].push(transaction);
  }

  const heatmap: { date: string; total: number }[] = [];
  for (
    let cursor = new Date(heatmapStart);
    cursor <= heatmapEnd;
    cursor = new Date(cursor.setDate(cursor.getDate() + 1))
  ) {
    const key = toDateKey(cursor);
    heatmap.push({ date: key, total: daySpendMap.get(key) ?? 0 });
  }

  return NextResponse.json({
    totals: {
      income: totals.income,
      expense: totals.expense,
      net,
      savingsRate,
    },
    expenseByCategory,
    incomeByCategory,
    heatmap,
    recentTransactions,
    dailyTransactions,
    monthCategoryTotals,
  });
}

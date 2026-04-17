import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import Budget from "@/models/Budget";
import Transaction from "@/models/Transaction";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

const budgetSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  period: z.enum(["weekly", "monthly"]),
  category: z.string().nullable().optional().default(null),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default("#6366f1"),
  alertThreshold: z.number().min(0).max(100).optional().default(80),
});

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  const userOid = new Types.ObjectId(userId);

  const [budgets, monthlyAgg, weeklyAgg] = await Promise.all([
    Budget.find({ userId }).lean(),
    Transaction.aggregate([
      {
        $match: {
          userId: userOid,
          type: "expense",
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          userId: userOid,
          type: "expense",
          date: { $gte: weekStart, $lte: weekEnd },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]),
  ]);

  const monthlyMap = new Map<string, number>(
    monthlyAgg.map((r) => [r._id as string, r.total as number])
  );
  const weeklyMap = new Map<string, number>(
    weeklyAgg.map((r) => [r._id as string, r.total as number])
  );

  const monthlyTotal = monthlyAgg.reduce(
    (sum: number, r) => sum + (r.total as number),
    0
  );
  const weeklyTotal = weeklyAgg.reduce(
    (sum: number, r) => sum + (r.total as number),
    0
  );

  const enriched = budgets.map((b) => {
    const spendMap = b.period === "monthly" ? monthlyMap : weeklyMap;
    const totalSpend = b.period === "monthly" ? monthlyTotal : weeklyTotal;
    const spent = b.category ? (spendMap.get(b.category) ?? 0) : totalSpend;
    return { ...b, spent };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const created = await Budget.create({ ...parsed.data, userId });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === 11000
    ) {
      return NextResponse.json(
        { error: "A budget with this period and category already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

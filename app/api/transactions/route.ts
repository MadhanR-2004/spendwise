import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  note: z.string().trim().optional().default(""),
  date: z.string(),
});

export async function GET(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const category = url.searchParams.get("category");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    const filter: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, Date>).$lte = new Date(endDate);
    }

    if (category) {
      const categories = category.split(",").map((item) => item.trim()).filter(Boolean);
      if (categories.length) {
        filter.category = { $in: categories };
      }
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search) {
      filter.note = { $regex: search, $options: "i" };
    }

    const total = await Transaction.countDocuments(filter);
    const data = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const created = await Transaction.create({
      ...parsed.data,
      userId,
      date: new Date(parsed.data.date),
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

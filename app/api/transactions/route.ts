import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { transactionCreateSchema, searchParamsSchema } from "@/lib/schemas";
import { getAuthedUser } from "@/lib/server";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const params = searchParamsSchema.safeParse({
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
      category: url.searchParams.get("category") || undefined,
      type: url.searchParams.get("type") || undefined,
      search: url.searchParams.get("search") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    });

    if (!params.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { startDate, endDate, category, type, search, page, limit } = params.data;
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
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.note = { $regex: escaped, $options: "i" };
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
    const parsed = transactionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    // Validate category exists (default or custom)
    const isDefault = DEFAULT_CATEGORIES.some((c) => c.name === parsed.data.category);
    if (!isDefault) {
      const categoryExists = await Category.exists({
        userId,
        name: parsed.data.category,
      });
      if (!categoryExists) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
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

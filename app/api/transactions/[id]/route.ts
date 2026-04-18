import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { transactionUpdateSchema } from "@/lib/schemas";
import { getAuthedUser } from "@/lib/server";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = transactionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();

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

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        ...parsed.data,
        date: new Date(parsed.data.date),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

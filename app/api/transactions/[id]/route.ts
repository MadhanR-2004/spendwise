import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  note: z.string().trim().optional().default(""),
  date: z.string(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
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

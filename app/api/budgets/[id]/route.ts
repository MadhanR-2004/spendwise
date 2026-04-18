import { connectToDatabase } from "@/lib/db";
import { budgetUpdateSchema } from "@/lib/schemas";
import { getAuthedUser } from "@/lib/server";
import Budget from "@/models/Budget";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = budgetUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await Budget.findOneAndUpdate(
      { _id: id, userId },
      parsed.data,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await Budget.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}

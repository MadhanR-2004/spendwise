import { connectToDatabase } from "@/lib/db";
import { goalUpdateSchema } from "@/lib/schemas";
import { getAuthedUser } from "@/lib/server";
import SavingsGoal from "@/models/SavingsGoal";
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
    const parsed = goalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch current goal to validate savedAmount cap
    const currentGoal = await SavingsGoal.findOne({ _id: id, userId });
    if (!currentGoal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // Calculate resulting savedAmount
    const targetAmount = parsed.data.targetAmount ?? currentGoal.targetAmount;
    let newSavedAmount = currentGoal.savedAmount;
    if (parsed.data.savedAmount !== undefined) {
      newSavedAmount = parsed.data.savedAmount;
    }
    if (parsed.data.addAmount) {
      newSavedAmount += parsed.data.addAmount;
    }
    if (newSavedAmount > targetAmount) {
      return NextResponse.json(
        { error: "Saved amount cannot exceed target amount" },
        { status: 400 }
      );
    }

    const { addAmount, deadline, ...rest } = parsed.data;
    const updateOps: Record<string, unknown> = {};

    const setOps: Record<string, unknown> = { ...rest };
    if (deadline !== undefined) {
      setOps.deadline = deadline ? new Date(deadline) : null;
    }
    if (Object.keys(setOps).length) {
      updateOps.$set = setOps;
    }
    if (addAmount) {
      updateOps.$inc = { savedAmount: addAmount };
    }

    const updated = await SavingsGoal.findOneAndUpdate(
      { _id: id, userId },
      updateOps,
      { new: true }
    );

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update goal" },
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
    const deleted = await SavingsGoal.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}

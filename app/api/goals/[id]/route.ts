import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import SavingsGoal from "@/models/SavingsGoal";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  savedAmount: z.number().min(0).optional(),
  addAmount: z.number().positive().optional(),
  deadline: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  icon: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!updated) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

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

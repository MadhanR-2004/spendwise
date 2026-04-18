import { connectToDatabase } from "@/lib/db";
import { goalCreateSchema } from "@/lib/schemas";
import { getAuthedUser } from "@/lib/server";
import SavingsGoal from "@/models/SavingsGoal";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();
  const goals = await SavingsGoal.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = goalCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    // Validate savedAmount doesn't exceed target
    if (parsed.data.savedAmount > parsed.data.targetAmount) {
      return NextResponse.json(
        { error: "Saved amount cannot exceed target amount" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const created = await SavingsGoal.create({
      ...parsed.data,
      userId,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

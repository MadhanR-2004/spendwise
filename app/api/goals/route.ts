import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import SavingsGoal from "@/models/SavingsGoal";
import { NextResponse } from "next/server";
import { z } from "zod";

const goalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  savedAmount: z.number().min(0).optional().default(0),
  deadline: z.string().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .default("#8b5cf6"),
  icon: z.string().optional().default("target"),
});

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
    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(["income", "expense"]),
});

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();
  const data = await Category.find({ userId }).sort({ type: 1, name: 1 }).lean();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const created = await Category.create({ ...parsed.data, userId });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

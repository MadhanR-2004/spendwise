import { connectToDatabase } from "@/lib/db";
import { CURRENCIES } from "@/lib/constants";
import { getAuthedUser } from "@/lib/server";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.enum(CURRENCIES).optional(),
});

export async function PUT(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findByIdAndUpdate(userId, parsed.data, { new: true }).lean();

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    await connectToDatabase();
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Category.deleteMany({ userId }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}

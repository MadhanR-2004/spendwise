import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export async function PUT(req: Request) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = passwordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

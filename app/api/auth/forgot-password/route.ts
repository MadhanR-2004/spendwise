import { connectToDatabase } from "@/lib/db";
import { rateLimitByIp } from "@/lib/rate-limit";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  const { success } = rateLimitByIp(req, "forgot-password", 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();

    const { email, otp, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check OTP
    const otpRecord = await Otp.findOne({ email, otp, type: "reset", used: false, expiresAt: { $gt: new Date() } });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}

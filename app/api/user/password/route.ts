import { BCRYPT_SALT_ROUNDS } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { rateLimitOtpAttempt } from "@/lib/rate-limit";
import { getAuthedUser } from "@/lib/server";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const passwordSchema = z.object({
  otp: z.string().length(6),
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

    // Rate-limit OTP verification attempts
    const otpLimit = rateLimitOtpAttempt(user.email, "password-change");
    if (!otpLimit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({
      email: user.email,
      otp: parsed.data.otp,
      type: "reset",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_SALT_ROUNDS);
    await user.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

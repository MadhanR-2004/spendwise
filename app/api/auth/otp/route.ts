import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { rateLimitByIp } from "@/lib/rate-limit";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const otpSchema = z.object({
  email: z.string().email(),
  type: z.enum(["register", "reset"]),
});

export async function POST(req: Request) {
  const { success } = rateLimitByIp(req, "otp", 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = otpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email, type } = parsed.data;
    await connectToDatabase();

    const exists = await User.exists({ email });

    if (type === "register" && exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    if (type === "reset" && !exists) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Invalidate any previous unused OTPs for this email+type
    await Otp.deleteMany({ email, type, used: false });

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    // Save to DB
    await Otp.create({
      email,
      otp,
      expiresAt,
      type,
    });

    // Send email
    const subject = type === "register" ? "Your Spendwise Verification Code" : "Reset Your Spendwise Password";
    const message = type === "register" 
      ? `Your sign up code is <b>${otp}</b>. It expires in 10 minutes.`
      : `Your password reset code is <b>${otp}</b>. It expires in 10 minutes.`;

    await sendEmail({
      to: email,
      subject,
      html: message,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

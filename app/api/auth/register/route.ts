import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connectToDatabase();

    const exists = await User.exists({ email: parsed.data.email });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const { email, otp, name, password } = parsed.data;
    
    // Check OTP
    const otpRecord = await Otp.findOne({ email, otp, type: "register", used: false });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
    
    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      passwordHash,
      currency: "INR",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

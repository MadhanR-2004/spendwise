import { connectToDatabase } from "@/lib/db";
import { rateLimitByIp } from "@/lib/rate-limit";
import User from "@/models/User";
import Otp from "@/models/Otp";
import Transaction from "@/models/Transaction";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.string().length(6),
  initialAmount: z.coerce.number().min(0).optional().default(0),
});

export async function POST(req: Request) {
  const { success } = rateLimitByIp(req, "register", 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

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

    const { email, otp, name, password, initialAmount } = parsed.data;
    
    // Check OTP
    const otpRecord = await Otp.findOne({ email, otp, type: "register", used: false, expiresAt: { $gt: new Date() } });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
    
    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      currency: "INR",
    });

    if (initialAmount > 0) {
      await Transaction.create({
        userId: user._id,
        amount: initialAmount,
        type: "income",
        category: "Other Income",
        note: "Opening balance",
        date: new Date(),
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}

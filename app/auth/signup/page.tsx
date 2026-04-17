"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "register" }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to send verification code");
      return false;
    }

    toast.success("Verification code sent to your email");
    startCooldown();
    return true;
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await sendOtp();
    if (ok) setStep(2);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        otp,
        initialAmount: Number(initialAmount || 0),
      }),
    });

    if (!res.ok) {
      setLoading(false);
      const data = await res.json();
      toast.error(data.error || "Unable to create account");
      return;
    }

    await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    setLoading(false);
    toast.success("Account created successfully");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{step === 1 ? "Create Spendwise account" : "Verify Email"}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form className="space-y-3" onSubmit={requestOtp}>
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Initial net amount (optional)"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
              />
              <Button className="w-full" disabled={loading}>
                {loading ? "Sending Code..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit}>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Enter the 6-digit code sent to {email}</p>
              <Input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required minLength={6} maxLength={6} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendCooldown > 0 || loading}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500 disabled:text-zinc-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn\u2019t receive the code? Resend"}
              </button>
            </form>
          )}
          {step === 1 && (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Have an account? <Link href="/auth/signin" className="text-indigo-600">Sign in</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

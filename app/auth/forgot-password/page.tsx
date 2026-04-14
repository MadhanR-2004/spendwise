"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "reset" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to send reset code");
      return;
    }

    toast.success("Reset code sent to your email");
    setStep(2);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password: newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Unable to reset password");
      return;
    }

    toast.success("Password reset successfully. You can now sign in.");
    router.push("/auth/signin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form className="space-y-3" onSubmit={requestOtp}>
              <p className="text-sm text-slate-500 mb-4">Enter your email address and we'll send you a verification code.</p>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button className="w-full" disabled={loading}>
                {loading ? "Sending Code..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit}>
              <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code sent to {email} and your new password.</p>
              <Input type="text" placeholder="6-digit verification code" value={otp} onChange={(e) => setOtp(e.target.value)} required minLength={6} maxLength={6} />
              <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-sm text-slate-500 text-center">
            Remembered your password? <Link href="/auth/signin" className="text-indigo-600">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

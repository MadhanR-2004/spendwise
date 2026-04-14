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
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
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
      return;
    }
    
    toast.success("Verification code sent to your email");
    setStep(2);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, otp }),
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
              <Button className="w-full" disabled={loading}>
                {loading ? "Sending Code..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onSubmit}>
              <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code sent to {email}</p>
              <Input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required minLength={6} maxLength={6} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          )}
          {step === 1 && (
            <p className="mt-4 text-sm text-slate-500">
              Have an account? <Link href="/auth/signin" className="text-indigo-600">Sign in</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

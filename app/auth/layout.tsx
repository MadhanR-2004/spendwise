import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return <div className="bg-slate-50 dark:bg-slate-950">{children}</div>;
}

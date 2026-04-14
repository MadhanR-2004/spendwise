import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

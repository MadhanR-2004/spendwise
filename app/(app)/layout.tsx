import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-7">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

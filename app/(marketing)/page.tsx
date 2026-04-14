import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChartColumn, ShieldCheck, Wallet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 md:px-6 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">Spendwise</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/auth/signin">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none max-w-3xl">
                Take Control of Your <span className="text-indigo-600">Finances</span> Today
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
                Spendwise is the simplest way to track your daily expenses, monitor your net balance, and achieve your saving goals without complex banking APIs.
              </p>
              <div className="space-x-4 mt-6">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 px-8 text-lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 items-start justify-center text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
                  <ChartColumn className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Deep Insights</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Visualize your spending habits with intuitive charts and GitHub-style heatmaps.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Private & Secure</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  No bank connections or third-party data tracking. Your transactions remain manual and private.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Easy Management</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Create custom categories, group transactions by month, and export to CSV in one click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Spendwise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

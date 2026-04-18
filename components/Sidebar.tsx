"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartColumn,
  Clock3,
  Gauge,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumn },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/budgets", label: "Budgets", icon: Gauge },
  { href: "/goals", label: "Goals", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("spendwise-theme", next ? "dark" : "light");
    setIsDark(next);
  }, []);

  return (
    <>
      {/* ===== Desktop sidebar ===== */}
      <aside aria-label="Main navigation" className="relative z-10 hidden border-r border-zinc-200/50 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.02] lg:flex lg:min-h-screen lg:w-72 lg:flex-col lg:px-5 lg:py-6">
        <div className="mb-8">
          <span className="text-xl font-bold tracking-tight">Spendwise</span>
        </div>

        <nav aria-label="Sidebar" className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-white/80 text-zinc-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-zinc-500 hover:bg-white/40 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            aria-label="Log out of your account"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ===== Mobile FAB + expandable menu ===== */}
      <div className="fixed bottom-5 right-5 z-50 lg:hidden">
        {/* Backdrop */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Vertical menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="absolute bottom-16 right-0 z-50 mb-2 flex w-52 flex-col gap-1 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/90 p-2 shadow-[0_8px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-900/90 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {links.map((link, i) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider */}
              <div className="mx-2 my-1 h-px bg-zinc-200 dark:bg-white/[0.08]" />

              {/* Logout */}
              <button
                type="button"
                aria-label="Log out of your account"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className={cn(
            "relative z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all",
            "border-white/25 bg-white/20 text-zinc-800 hover:bg-white/30",
            "dark:border-white/[0.12] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.14] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          )}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: mobileOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Inner refraction ring */}
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/[0.1]" />
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </motion.button>
      </div>
    </>
  );
}

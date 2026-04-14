"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChartColumn, Clock3, LogOut, Moon, Settings, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumn },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const dark = root.classList.contains("dark");
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("spendwise-theme", next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <aside className="w-full border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">Spendwise</div>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-wrap gap-2 lg:mt-8">
        <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-lg">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Theme
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

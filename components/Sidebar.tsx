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
    <aside className="w-full border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:w-64">
      <div className="mb-8 text-xl font-bold">Spendwise</div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                pathname === link.href
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 flex gap-2">
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          Theme
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

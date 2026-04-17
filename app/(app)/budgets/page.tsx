"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, AlertTriangle, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { BudgetModal } from "@/components/BudgetModal";
import { Button } from "@/components/ui/button";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { BudgetItem } from "@/types";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    const [budgetRes, catRes, sessionRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/categories"),
      fetch("/api/auth/session"),
    ]);
    const budgetJson = await budgetRes.json();
    const catJson = await catRes.json();
    const sessionJson = await sessionRes.json();
    setBudgets(budgetJson);
    setCategories([...DEFAULT_CATEGORIES, ...catJson]);
    setCurrency(sessionJson?.user?.currency ?? "INR");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteBudget = async (id: string) => {
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete budget");
    toast.success("Budget deleted");
    load();
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return "#ef4444";
    if (pct >= 80) return "#f59e0b";
    if (pct >= 60) return "#eab308";
    return "#22c55e";
  };

  const monthlyBudgets = budgets.filter((b) => b.period === "monthly");
  const totalBudget = monthlyBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthlyBudgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      <ConfirmDialog {...confirm.dialogProps} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Set spending limits and track your progress
          </p>
        </div>
        <BudgetModal
          trigger={
            <ShimmerButton>
              <Plus className="h-4 w-4" />
              Add Budget
            </ShimmerButton>
          }
          categories={categories.map((c) => ({
            name: c.name,
            type: c.type,
          }))}
          onSaved={load}
        />
      </div>

      {/* Overview */}
      {budgets.length > 0 && (
        <GlassCard className="p-6" glow>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Monthly Budget
              </p>
              <p className="mt-1 text-2xl font-bold">
                <AnimatedCounter
                  value={totalBudget}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Spent So Far
              </p>
              <p className="mt-1 text-2xl font-bold text-red-500">
                <AnimatedCounter
                  value={totalSpent}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Remaining
              </p>
              <p
                className={`mt-1 text-2xl font-bold ${totalBudget - totalSpent >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                <AnimatedCounter
                  value={totalBudget - totalSpent}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Utilization
              </p>
              <p className="mt-1 text-2xl font-bold">
                <AnimatedCounter
                  value={
                    totalBudget > 0
                      ? (totalSpent / totalBudget) * 100
                      : 0
                  }
                  formatter={(v) => `${v.toFixed(0)}%`}
                />
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <TrendingDown className="mb-4 h-12 w-12 text-zinc-400" />
          <h3 className="text-lg font-semibold">No budgets yet</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create your first budget to start tracking spending limits.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {budgets.map((budget, i) => {
              const pct =
                budget.amount > 0
                  ? (budget.spent / budget.amount) * 100
                  : 0;
              const statusColor = getStatusColor(pct);
              const isOver = pct >= 100;
              const isWarning = pct >= budget.alertThreshold;

              return (
                <GlassCard
                  key={budget._id}
                  className="p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{budget.name}</h3>
                        {isWarning && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300">
                          {budget.period}
                        </span>
                        {budget.category && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: budget.color + "20",
                              color: budget.color,
                            }}
                          >
                            {budget.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <ProgressRing
                      progress={Math.min(pct, 100)}
                      size={64}
                      strokeWidth={5}
                      color={statusColor}
                    >
                      <span className="text-xs font-bold">
                        {Math.round(pct)}%
                      </span>
                    </ProgressRing>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>
                        {formatCurrency(budget.spent, currency)} spent
                      </span>
                      <span>
                        {formatCurrency(budget.amount, currency)} limit
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: statusColor }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(pct, 100)}%`,
                        }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      />
                    </div>
                  </div>

                  {isOver && (
                    <p className="mt-2 text-xs text-red-400">
                      Over budget by{" "}
                      {formatCurrency(
                        budget.spent - budget.amount,
                        currency
                      )}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-400"
                      onClick={() => confirm.open(() => deleteBudget(budget._id), { title: "Delete budget?", description: `"${budget.name}" will be permanently removed.`, confirmLabel: "Delete" })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

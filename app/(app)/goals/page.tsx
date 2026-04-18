"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Trophy, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GoalModal } from "@/components/GoalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, friendlyDate } from "@/lib/utils";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { GoalsSkeleton } from "@/components/ui/skeleton";
import { SavingsGoalItem } from "@/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalsRes, sessionRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/auth/session"),
      ]);
      if (!goalsRes.ok) throw new Error("Failed to load goals");
      const goalsJson = await goalsRes.json();
      const sessionJson = await sessionRes.json();
      setGoals(goalsJson);
      setCurrency(sessionJson?.user?.currency ?? "INR");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete goal");
    toast.success("Goal deleted");
    load();
  };

  const addSavings = async (id: string, amount: number) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addAmount: amount }),
    });
    if (!res.ok) return toast.error("Failed to add savings");
    toast.success(`Added ${formatCurrency(amount, currency)} to goal!`);
    load();
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  if (loading) return <GoalsSkeleton />;

  return (
    <div className="space-y-6">
      <ConfirmDialog {...confirm.dialogProps} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Savings Goals
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track progress towards your financial targets
          </p>
        </div>
        <GoalModal
          trigger={
            <ShimmerButton variant="secondary">
              <Plus className="h-4 w-4" />
              New Goal
            </ShimmerButton>
          }
          onSaved={load}
        />
      </div>

      {/* Overview */}
      {goals.length > 0 && (
        <GlassCard className="p-6" glow>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Target
              </p>
              <p className="mt-1 text-2xl font-bold">
                <AnimatedCounter
                  value={totalTarget}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Saved
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-500">
                <AnimatedCounter
                  value={totalSaved}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Progress
              </p>
              <p className="mt-1 text-2xl font-bold text-indigo-400">
                <AnimatedCounter
                  value={
                    totalTarget > 0
                      ? (totalSaved / totalTarget) * 100
                      : 0
                  }
                  formatter={(v) => `${v.toFixed(0)}%`}
                />
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Goals Grid */}
      {error ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">{error}</p>
          <button onClick={load} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">Retry</button>
        </div>
      ) : goals.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <Trophy className="mb-4 h-12 w-12 text-zinc-400" />
          <h3 className="text-lg font-semibold">No goals yet</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create a savings goal to start tracking your progress.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {goals.map((goal, i) => {
              const pct =
                goal.targetAmount > 0
                  ? (goal.savedAmount / goal.targetAmount) * 100
                  : 0;
              const isComplete = pct >= 100;

              return (
                <GoalCardItem
                  key={goal._id}
                  goal={goal}
                  pct={pct}
                  isComplete={isComplete}
                  currency={currency}
                  index={i}
                  onDelete={() => confirm.open(() => deleteGoal(goal._id), { title: "Delete goal?", description: `"${goal.name}" will be permanently removed.`, confirmLabel: "Delete" })}
                  onAddSavings={(amount) =>
                    addSavings(goal._id, amount)
                  }
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function GoalCardItem({
  goal,
  pct,
  isComplete,
  currency,
  index,
  onDelete,
  onAddSavings,
}: {
  goal: SavingsGoalItem;
  pct: number;
  isComplete: boolean;
  currency: string;
  index: number;
  onDelete: () => void;
  onAddSavings: (amount: number) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  return (
    <GlassCard
      className="p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: goal.color + "20" }}
          >
            {isComplete ? (
              <Sparkles
                className="h-5 w-5"
                style={{ color: goal.color }}
              />
            ) : (
              <Target
                className="h-5 w-5"
                style={{ color: goal.color }}
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Due {friendlyDate(goal.deadline)}
              </p>
            )}
          </div>
        </div>
        {isComplete && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            COMPLETE
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{formatCurrency(goal.savedAmount, currency)}</span>
          <span>{formatCurrency(goal.targetAmount, currency)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: goal.color,
              boxShadow: `0 0 12px ${goal.color}40`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.3,
            }}
          />
        </div>
        <p
          className="mt-1 text-right text-xs font-medium"
          style={{ color: goal.color }}
        >
          {pct.toFixed(0)}%
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs">
              <Plus className="mr-1 h-3 w-3" />
              Add Savings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>Add to &quot;{goal.name}&quot;</DialogTitle>
              <DialogDescription>
                How much have you saved?
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(addAmount);
                if (val > 0) {
                  onAddSavings(val);
                  setAddOpen(false);
                  setAddAmount("");
                }
              }}
              className="mt-2 space-y-3"
            >
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="Amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full">
                Add
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-red-400"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </GlassCard>
  );
}

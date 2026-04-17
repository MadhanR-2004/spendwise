"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsResponse } from "@/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [analyticsRes, sessionRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/auth/session"),
      ]);
      const analytics = await analyticsRes.json();
      const session = await sessionRes.json();
      setData(analytics);
      setCurrency(session?.user?.currency ?? "INR");
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!data) return null;

  const expenseChange =
    data.monthComparison.lastMonth.expense > 0
      ? ((data.monthComparison.thisMonth.expense -
          data.monthComparison.lastMonth.expense) /
          data.monthComparison.lastMonth.expense) *
        100
      : 0;

  const incomeChange =
    data.monthComparison.lastMonth.income > 0
      ? ((data.monthComparison.thisMonth.income -
          data.monthComparison.lastMonth.income) /
          data.monthComparison.lastMonth.income) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Deep insights into your spending patterns
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-5" glow>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Avg Daily Spend
              </p>
              <p className="text-xl font-bold">
                <AnimatedCounter
                  value={data.avgDailySpend}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Projected Monthly
              </p>
              <p className="text-xl font-bold">
                <AnimatedCounter
                  value={data.projectedMonthlySpend}
                  formatter={(v) => formatCurrency(v, currency)}
                />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Top Category
              </p>
              <p className="text-xl font-bold">
                {data.topCategory?.name ?? "—"}
              </p>
              {data.topCategory && (
                <p className="text-xs text-zinc-500">
                  {formatCurrency(data.topCategory.amount, currency)}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Month Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold">Expenses</h3>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${expenseChange > 0 ? "text-red-400" : "text-emerald-400"}`}
            >
              {expenseChange > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(expenseChange).toFixed(0)}% vs last month
            </span>
          </div>
          <p className="text-2xl font-bold">
            <AnimatedCounter
              value={data.monthComparison.thisMonth.expense}
              formatter={(v) => formatCurrency(v, currency)}
            />
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Last month:{" "}
            {formatCurrency(
              data.monthComparison.lastMonth.expense,
              currency
            )}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold">Income</h3>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${incomeChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {incomeChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(incomeChange).toFixed(0)}% vs last month
            </span>
          </div>
          <p className="text-2xl font-bold">
            <AnimatedCounter
              value={data.monthComparison.thisMonth.income}
              formatter={(v) => formatCurrency(v, currency)}
            />
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Last month:{" "}
            {formatCurrency(
              data.monthComparison.lastMonth.income,
              currency
            )}
          </p>
        </GlassCard>
      </div>

      {/* Spending Trend */}
      <GlassCard className="p-5">
        <h3 className="mb-4 font-semibold">Spending Trend (30 Days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailySpending}>
              <defs>
                <linearGradient
                  id="expenseGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#ef4444"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#ef4444"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="incomeGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#22c55e"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#22c55e"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(161,161,170,0.15)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickFormatter={(v) => v.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  color: "#18181b",
                }}
                labelStyle={{ color: "#71717a" }}
                formatter={(value) =>
                  formatCurrency(Number(value ?? 0), currency)
                }
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                fill="url(#expenseGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                fill="url(#incomeGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Category Comparison */}
      {data.categoryComparison.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="mb-4 font-semibold">
            Category Comparison (This Month vs Last)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryComparison.slice(0, 8)}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(161,161,170,0.15)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={100}
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    color: "#18181b",
                  }}
                  formatter={(value) =>
                    formatCurrency(Number(value ?? 0), currency)
                  }
                />
                <Bar
                  dataKey="thisMonth"
                  name="This Month"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="lastMonth"
                  name="Last Month"
                  fill="#a1a1aa"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Smart Insights */}
      {data.insights.length > 0 && (
        <GlassCard className="p-5" glow>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-white/[0.03]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {insight.type === "warning" && (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                )}
                {insight.type === "success" && (
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                )}
                {insight.type === "info" && (
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                )}
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {insight.message}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

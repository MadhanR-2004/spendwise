"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryGrid } from "@/components/CategoryGrid";
import { EODPanel } from "@/components/EODPanel";
import { SpendHeatmap } from "@/components/SpendHeatmap";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionModal } from "@/components/TransactionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { formatCurrency, friendlyDate } from "@/lib/utils";
import { SummaryResponse } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const load = async () => {
    setLoading(true);
    const [summaryRes, sessionRes] = await Promise.all([
      fetch("/api/summary"),
      fetch("/api/auth/session"),
    ]);
    const summaryJson = await summaryRes.json();
    const sessionJson = await sessionRes.json();
    setSummary(summaryJson);
    setCurrency(sessionJson?.user?.currency ?? "INR");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const custom = await res.json();
        setCategories([...DEFAULT_CATEGORIES, ...custom]);
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    };

    loadCategories();
  }, []);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    summary?.expenseByCategory.forEach((item) => map.set(item.name, item.color));
    summary?.incomeByCategory.forEach((item) => map.set(item.name, item.color));
    summary?.monthCategoryTotals.forEach((item) => map.set(item.category, item.color));
    return map;
  }, [summary]);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />;
  }

  if (!summary) return null;

  const selectedItems = selectedDate ? summary.dailyTransactions[selectedDate] ?? [] : [];
  const selectedClosingBalance = selectedDate ? summary.dailyClosingBalances[selectedDate] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <TransactionModal
          triggerLabel="Add Transaction"
          categories={categories.map((item) => ({ name: item.name, type: item.type }))}
          onSaved={load}
        />
      </div>

      <SummaryCards
        currency={currency}
        income={summary.totals.income}
        expense={summary.totals.expense}
        net={summary.totals.net}
        savingsRate={summary.totals.savingsRate}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.expenseByCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>
                  {summary.expenseByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), currency)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.incomeByCategory} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100}>
                  {summary.incomeByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), currency)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <CategoryGrid data={summary.monthCategoryTotals} currency={currency} />

      <Card>
        <CardHeader>
          <CardTitle>Spending Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendHeatmap
            data={summary.heatmap}
            selectedDate={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            currency={currency}
          />
          {selectedDate && selectedItems.length > 0 && (
            <EODPanel
              date={selectedDate}
              items={selectedItems}
              currency={currency || "INR"}
              closingBalance={selectedClosingBalance}
              onClose={() => setSelectedDate(undefined)}
              getCategoryColor={(name) => colorMap.get(name) ?? "#64748b"}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.recentTransactions.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorMap.get(item.category) ?? "#64748b" }} />
                  <span>{item.note || item.category}</span>
                  <span className="text-slate-500">{friendlyDate(item.date)}</span>
                </div>
                <span className={item.type === "income" ? "text-green-600" : "text-red-600"}>
                  {item.type === "income" ? "+" : "-"}
                  {formatCurrency(item.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

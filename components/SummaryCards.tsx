"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { formatCurrency } from "@/lib/utils";

export function SummaryCards({
  currency,
  income,
  expense,
  net,
  savingsRate,
}: {
  currency: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}) {
  const cards = [
    {
      title: "Total Income",
      value: income,
      formatter: (v: number) => formatCurrency(v, currency),
      tone: "text-emerald-500",
    },
    {
      title: "Total Expenses",
      value: expense,
      formatter: (v: number) => formatCurrency(v, currency),
      tone: "text-red-500",
    },
    {
      title: "Net Balance",
      value: net,
      formatter: (v: number) => formatCurrency(v, currency),
      tone: net >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      title: "Savings Rate",
      value: savingsRate,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      tone: "text-indigo-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <GlassCard
          key={card.title}
          className="p-5"
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {card.title}
          </p>
          <div className={`mt-2 text-2xl font-bold ${card.tone}`}>
            <AnimatedCounter value={card.value} formatter={card.formatter} />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

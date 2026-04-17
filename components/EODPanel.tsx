"use client";

import { X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TransactionItem } from "@/types";

export function EODPanel({
  date,
  items,
  currency,
  closingBalance,
  onClose,
  getCategoryColor,
}: {
  date: string;
  items: TransactionItem[];
  currency: string;
  closingBalance?: number;
  onClose: () => void;
  getCategoryColor: (name: string) => string;
}) {
  const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const net = income - expense;

  return (
    <div className="mt-4 animate-in slide-in-from-top-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{format(new Date(date), "EEEE, d MMMM yyyy")}</h3>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(item.category) }} />
              <span className="text-zinc-800 dark:text-zinc-200">{item.category}</span>
              <span className="text-zinc-500 dark:text-zinc-400">{item.note || "-"}</span>
            </div>
            <span className={item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
              {item.type === "income" ? "+" : "-"}
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400 md:grid-cols-4">
        <div>Income: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(income, currency)}</span></div>
        <div>Expense: <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(expense, currency)}</span></div>
        <div>Net: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(net, currency)}</span></div>
        <div>Closing: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(closingBalance ?? net, currency || "INR")}</span></div>
      </div>
    </div>
  );
}

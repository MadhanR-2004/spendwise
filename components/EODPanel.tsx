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
  onClose,
  getCategoryColor,
}: {
  date: string;
  items: TransactionItem[];
  currency: string;
  onClose: () => void;
  getCategoryColor: (name: string) => string;
}) {
  const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const net = income - expense;

  return (
    <div className="mt-4 animate-in slide-in-from-top-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{format(new Date(date), "EEEE, d MMMM yyyy")}</h3>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item._id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(item.category) }} />
              <span>{item.category}</span>
              <span className="text-slate-500">{item.note || "-"}</span>
            </div>
            <span className={item.type === "income" ? "text-green-600" : "text-red-600"}>
              {item.type === "income" ? "+" : "-"}
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>Total Income: {formatCurrency(income, currency)}</div>
        <div>Total Expense: {formatCurrency(expense, currency)}</div>
        <div>Net: {formatCurrency(net, currency)}</div>
      </div>
    </div>
  );
}

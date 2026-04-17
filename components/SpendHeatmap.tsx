"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  eachDayOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

type HeatItem = { date: string; total: number };

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SpendHeatmap({
  data,
  selectedDate,
  onSelect,
  currency,
}: {
  data: HeatItem[];
  selectedDate?: string;
  onSelect: (date: string) => void;
  currency: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const max = Math.max(...data.map((item) => item.total), 1);

  const spendMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => map.set(item.date, item.total));
    return map;
  }, [data]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const getIntensity = useCallback(
    (total: number) => {
      if (!total || total <= 0) return 0;
      const ratio = total / max;
      if (ratio <= 0.25) return 1;
      if (ratio <= 0.5) return 2;
      if (ratio <= 0.75) return 3;
      return 4;
    },
    [max]
  );

  const intensityClasses: Record<number, string> = {
    0: "bg-zinc-100 dark:bg-white/[0.03]",
    1: "bg-emerald-100 dark:bg-emerald-500/10",
    2: "bg-emerald-200 dark:bg-emerald-500/20",
    3: "bg-emerald-400/60 dark:bg-emerald-500/35",
    4: "bg-emerald-500 dark:bg-emerald-400/60 text-white dark:text-emerald-100",
  };

  return (
    <div className="w-full select-none">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h4 className="text-sm font-semibold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h4>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {weekdays.map((d) => (
          <div
            key={d}
            className="py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const total = spendMap.get(key) ?? 0;
          const level = getIntensity(total);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-medium transition-all duration-200",
                inMonth
                  ? intensityClasses[level]
                  : "bg-transparent text-zinc-300 dark:text-zinc-700",
                today &&
                  "ring-1 ring-indigo-500/50 ring-offset-1 ring-offset-white dark:ring-offset-black",
                selected &&
                  "ring-2 ring-white shadow-lg dark:ring-zinc-300",
                inMonth &&
                  "hover:scale-105 hover:shadow-md cursor-pointer"
              )}
              title={
                total > 0
                  ? `${format(day, "PPP")}: ${formatCurrency(total, currency)}`
                  : format(day, "PPP")
              }
            >
              <span
                className={cn(
                  "text-[13px] leading-none",
                  !inMonth && "opacity-30"
                )}
              >
                {format(day, "d")}
              </span>
              {total > 0 && inMonth && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-current opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-3 w-3 rounded",
              intensityClasses[level]
            )}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

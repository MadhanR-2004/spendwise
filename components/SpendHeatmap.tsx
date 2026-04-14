"use client";

import { format, getDay, parseISO } from "date-fns";

type HeatItem = { date: string; total: number };

function intensity(total: number, max: number) {
  if (total <= 0) return 0;
  if (max <= 0) return 0;
  const ratio = total / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

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
  const max = Math.max(...data.map((item) => item.total), 0);

  const weeks: HeatItem[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((week, index) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const month = format(parseISO(firstDay.date), "MMM");
    if (month !== lastMonth) {
      monthLabels.push({ index, label: month });
      lastMonth = month;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex text-xs text-slate-500" style={{ marginLeft: 28 }}>
        {weeks.map((_, index) => (
          <div key={index} className="w-3 text-center">
            {monthLabels.find((item) => item.index === index)?.label ?? ""}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="mt-1 grid grid-rows-7 gap-1 text-xs text-slate-500">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((label, index) => (
            <div key={index} className="h-3 leading-3">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {weeks.map((week, weekIndex) =>
            week.map((item) => {
              const level = intensity(item.total, max);
              const day = getDay(parseISO(item.date));
              const row = day === 0 ? 0 : day;
              return (
                <button
                  key={item.date}
                  className={`h-3 w-3 rounded-sm heat-${level} ${selectedDate === item.date ? "ring-2 ring-indigo-500" : ""}`}
                  style={{ gridRow: row + 1, gridColumn: weekIndex + 1 }}
                  title={`${format(parseISO(item.date), "PPP")}: ${new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency,
                  }).format(item.total)}`}
                  onClick={() => onSelect(item.date)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

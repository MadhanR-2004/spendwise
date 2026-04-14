"use client";

import { useMemo } from "react";
import Calendar from "react-calendar";
import { format, parseISO } from "date-fns";
import "react-calendar/dist/Calendar.css";

type HeatItem = { date: string; total: number };

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

  const toDateKey = (value: Date | string) => {
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      return format(parseISO(value), "yyyy-MM-dd");
    }
    return format(value, "yyyy-MM-dd");
  };

  const getIntensity = (total: number) => {
    if (!total || total <= 0) return 0;
    if (max <= 0) return 0;
    const ratio = total / max;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const spendMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => map.set(item.date, item.total));
    return map;
  }, [data]);

  const selectedDateValue = selectedDate ? parseISO(selectedDate) : new Date();

  return (
    <div className="w-full pb-3">
      <Calendar
        value={selectedDateValue}
        onChange={(value) => {
          const picked = Array.isArray(value) ? value[0] : value;
          if (picked) onSelect(toDateKey(picked));
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";
          const key = toDateKey(date);
          const total = spendMap.get(key) ?? 0;
          const level = getIntensity(total);
          const selected = selectedDate === key ? "sp-cal-selected" : "";
          return `sp-cal-tile sp-cal-${level} ${selected}`;
        }}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const key = toDateKey(date);
          const total = spendMap.get(key) ?? 0;
          if (total <= 0) return null;

          const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(total);

          return <span className="sp-cal-dot" title={`${format(date, "PPP")}: ${formatted}`} />;
        }}
      />

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: 1px solid #27272a;
          border-radius: 12px;
          background: #000;
          color: #f4f4f5;
          padding: 14px;
          font-family: inherit;
        }

        .react-calendar button {
          color: #f4f4f5;
          border-radius: 10px;
          border: 1px solid transparent;
        }

        .react-calendar__navigation button {
          min-width: 42px;
          background: transparent;
          font-weight: 600;
          color: #f4f4f5;
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus,
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #18181b;
        }

        .react-calendar__month-view__weekdays__weekday {
          color: #a1a1aa;
          font-size: 12px;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }

        .react-calendar__month-view__days__day--neighboringMonth {
          color: #52525b;
        }

        .sp-cal-tile {
          position: relative;
          cursor: pointer;
          transition: background-color 0.18s ease;
        }

        .sp-cal-0 {
          background: #09090b;
        }

        .sp-cal-1 {
          background: #0a2e1a;
        }

        .sp-cal-2 {
          background: #0e4a2a;
        }

        .sp-cal-3 {
          background: #166534;
        }

        .sp-cal-4 {
          background: #22c55e;
          color: #04150b !important;
        }

        .sp-cal-selected {
          outline: 2px solid #fafafa;
          outline-offset: -2px;
        }

        .sp-cal-dot {
          position: absolute;
          right: 6px;
          bottom: 6px;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
        }
      `}</style>
    </div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export function toDateKey(value: Date | string) {
  return format(new Date(value), "yyyy-MM-dd");
}

export function friendlyDate(value: Date | string) {
  return format(new Date(value), "PPP");
}

export function monthLabel(value: Date | string) {
  return format(new Date(value), "MMMM yyyy");
}

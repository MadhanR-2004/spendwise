import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALE: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function formatCurrency(amount: number, currency = "INR") {
  const locale = CURRENCY_LOCALE[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
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

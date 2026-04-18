export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Dining", color: "#ef4444", type: "expense" as const },
  { name: "Transport", color: "#f97316", type: "expense" as const },
  { name: "Rent", color: "#eab308", type: "expense" as const },
  { name: "Utilities", color: "#22c55e", type: "expense" as const },
  { name: "Shopping", color: "#14b8a6", type: "expense" as const },
  { name: "Entertainment", color: "#06b6d4", type: "expense" as const },
  { name: "Health", color: "#3b82f6", type: "expense" as const },
  { name: "Education", color: "#6366f1", type: "expense" as const },
  { name: "Personal Care", color: "#8b5cf6", type: "expense" as const },
  { name: "Miscellaneous", color: "#ec4899", type: "expense" as const },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", color: "#16a34a", type: "income" as const },
  { name: "Freelance", color: "#0d9488", type: "income" as const },
  { name: "Investment", color: "#0891b2", type: "income" as const },
  { name: "Gift", color: "#2563eb", type: "income" as const },
  { name: "Other Income", color: "#7c3aed", type: "income" as const },
];

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

export const DEFAULT_CURRENCY = "INR" as const;

export const MAX_AMOUNT = 999_999_999.99;

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export const BCRYPT_SALT_ROUNDS = 10;

export const RATE_LIMITS = {
  otp: { limit: 5, windowMs: 60_000 },
  register: { limit: 5, windowMs: 60_000 },
  forgotPassword: { limit: 5, windowMs: 60_000 },
  otpAttempt: { limit: 5, windowMs: 15 * 60_000 },
} as const;

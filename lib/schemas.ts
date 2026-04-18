import { z } from "zod";
import { MAX_AMOUNT } from "./constants";

// ── Shared primitives ──────────────────────────────────────

export const amountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(MAX_AMOUNT, `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}`);

export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color");

export const dateStringSchema = z.string().refine(
  (val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
  },
  { message: "Invalid date" }
);

// ── Transaction ────────────────────────────────────────────

export const transactionCreateSchema = z.object({
  amount: amountSchema,
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  note: z.string().trim().max(500).optional().default(""),
  date: dateStringSchema,
});

export const transactionUpdateSchema = transactionCreateSchema;

// ── Budget ─────────────────────────────────────────────────

export const budgetCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: amountSchema,
  period: z.enum(["weekly", "monthly"]),
  category: z.string().nullable().optional().default(null),
  color: colorSchema.optional().default("#6366f1"),
  alertThreshold: z.number().min(0).max(100).optional().default(80),
});

export const budgetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: amountSchema.optional(),
  period: z.enum(["weekly", "monthly"]).optional(),
  category: z.string().nullable().optional(),
  color: colorSchema.optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
});

// ── Savings Goal ───────────────────────────────────────────

export const goalCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: amountSchema,
  savedAmount: z.number().min(0).optional().default(0),
  deadline: dateStringSchema.nullable().optional(),
  color: colorSchema.optional().default("#8b5cf6"),
  icon: z.string().max(30).optional().default("target"),
});

export const goalUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: amountSchema.optional(),
  savedAmount: z.number().min(0).optional(),
  addAmount: z.number().positive().optional(),
  deadline: dateStringSchema.nullable().optional(),
  color: colorSchema.optional(),
  icon: z.string().max(30).optional(),
});

// ── Search / query params ──────────────────────────────────

export const searchParamsSchema = z.object({
  search: z.string().max(100).optional(),
  category: z.string().max(500).optional(),
  type: z.enum(["income", "expense", "all"]).optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

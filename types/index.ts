export type TransactionType = "income" | "expense";

export type TransactionItem = {
  _id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  date: string;
  createdAt: string;
};

export type CategoryItem = {
  _id: string;
  name: string;
  color: string;
  type: TransactionType;
};

export type SummaryResponse = {
  totals: {
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
  };
  expenseByCategory: { name: string; value: number; color: string }[];
  incomeByCategory: { name: string; value: number; color: string }[];
  heatmap: { date: string; total: number }[];
  recentTransactions: TransactionItem[];
  dailyTransactions: Record<string, TransactionItem[]>;
  dailyClosingBalances: Record<string, number>;
  monthCategoryTotals: { category: string; total: number; color: string }[];
};

export type BudgetItem = {
  _id: string;
  name: string;
  amount: number;
  period: "weekly" | "monthly";
  category: string | null;
  color: string;
  alertThreshold: number;
  spent: number;
};

export type SavingsGoalItem = {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  color: string;
  icon: string;
};

export type AnalyticsResponse = {
  dailySpending: { date: string; income: number; expense: number }[];
  categoryComparison: {
    category: string;
    thisMonth: number;
    lastMonth: number;
    change: number;
    color: string;
  }[];
  monthComparison: {
    thisMonth: { income: number; expense: number };
    lastMonth: { income: number; expense: number };
  };
  insights: { type: "warning" | "success" | "info"; message: string }[];
  avgDailySpend: number;
  projectedMonthlySpend: number;
  topCategory: { name: string; amount: number } | null;
};

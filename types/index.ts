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

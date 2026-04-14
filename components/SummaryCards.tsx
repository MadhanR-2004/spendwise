import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SummaryCards({
  currency,
  income,
  expense,
  net,
  savingsRate,
}: {
  currency: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
}) {
  const cards = [
    { title: "Total Income", value: formatCurrency(income, currency), tone: "text-green-600" },
    { title: "Total Expenses", value: formatCurrency(expense, currency), tone: "text-red-600" },
    { title: "Net Balance", value: formatCurrency(net, currency), tone: net >= 0 ? "text-green-600" : "text-red-600" },
    { title: "Savings Rate", value: `${savingsRate.toFixed(2)}%`, tone: "text-indigo-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-semibold ${card.tone}`}>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

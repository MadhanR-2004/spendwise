import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CategoryGrid({
  data,
  currency,
}: {
  data: { category: string; total: number; color: string }[];
  currency: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Spend (This Month)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((item) => (
            <div key={item.category} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.category}</span>
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{formatCurrency(item.total, currency)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

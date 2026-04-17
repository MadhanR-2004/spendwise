"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { TransactionModal } from "@/components/TransactionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { TransactionItem } from "@/types";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const confirm = useConfirm();

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    params.set("page", String(page));
    params.set("limit", "10");

    const [txRes, customCategories, sessionRes] = await Promise.all([
      fetch(`/api/transactions?${params.toString()}`),
      fetch("/api/categories"),
      fetch("/api/auth/session"),
    ]);

    const txJson = await txRes.json();
    const customJson = await customCategories.json();
    const sessionJson = await sessionRes.json();

    setTransactions(txJson.data ?? []);
    setPages(txJson.pages ?? 1);
    setCategories([...DEFAULT_CATEGORIES, ...customJson]);
    setCurrency(sessionJson?.user?.currency ?? "INR");
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, search, type, selectedCategories.join(","), page]);

  const grouped = useMemo(() => {
    return transactions.reduce<Record<string, TransactionItem[]>>((acc, item) => {
      const key = monthLabel(item.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [transactions]);

  const remove = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete transaction");
      return;
    }
    toast.success("Transaction deleted");
    fetchData();
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog {...confirm.dialogProps} />
      <h1 className="text-2xl font-semibold">History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div className="grid grid-cols-3 gap-1 rounded-md border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              {[
                { key: "all", label: "All" },
                { key: "income", label: "Income" },
                { key: "expense", label: "Expense" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setType(item.key)}
                  className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                    type === item.key
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-100 dark:text-black"
                      : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Input placeholder="Search note" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between"
                >
                  {selectedCategories.length ? `${selectedCategories.length} categories selected` : "Filter categories"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="max-h-64 overflow-auto border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Categories</p>
                  <button
                    type="button"
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {categories.map((item) => {
                    const checked = selectedCategories.includes(item.name);
                    return (
                      <label
                        key={item.name}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300 accent-indigo-600 dark:border-zinc-600 dark:accent-zinc-200"
                          checked={checked}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              checked ? prev.filter((name) => name !== item.name) : [...prev, item.name]
                            );
                          }}
                        />
                        <span>{item.name}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        <TabsList className="mt-2">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Grouped</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                        <th className="p-2">Date</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Note</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((item) => (
                        <tr key={item._id} className="border-b border-zinc-100 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                          <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="p-2">{item.category}</td>
                          <td className="p-2">{item.note || "-"}</td>
                          <td className="p-2">{item.type}</td>
                          <td className={`p-2 ${item.type === "income" ? "text-green-500" : "text-red-500"}`}>
                            {formatCurrency(item.amount, currency)}
                          </td>
                          <td className="p-2 space-x-2">
                            <TransactionModal
                              triggerLabel="Edit"
                              categories={categories.map((cat) => ({ name: cat.name, type: cat.type }))}
                              onSaved={fetchData}
                              editItem={{
                                _id: item._id,
                                amount: item.amount,
                                category: item.category,
                                type: item.type,
                                date: new Date(item.date).toISOString().slice(0, 10),
                                note: item.note,
                              }}
                            />
                            <Button size="sm" variant="destructive" onClick={() => confirm.open(() => remove(item._id), { title: "Delete transaction?", description: "This transaction will be permanently removed." , confirmLabel: "Delete" })}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <span className="text-sm">{page} / {pages}</span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardContent className="space-y-4 pt-4">
              {Object.entries(grouped).map(([month, items]) => {
                const subtotal = items.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0);
                return (
                  <div key={month}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{month}</h3>
                      <span className={subtotal >= 0 ? "text-green-500" : "text-red-500"}>
                        {formatCurrency(subtotal, currency)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                          <div>{item.category} - {item.note || "-"}</div>
                          <div className={item.type === "income" ? "text-green-500" : "text-red-500"}>
                            {formatCurrency(item.amount, currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

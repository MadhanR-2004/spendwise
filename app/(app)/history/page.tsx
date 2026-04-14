"use client";

import { useEffect, useMemo, useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { TransactionItem } from "@/types";
import { toast } from "sonner";

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
  const [editItem, setEditItem] = useState<TransactionItem | null>(null);

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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold">History</h1>
        <TransactionModal
          categories={categories.map((item) => ({ name: item.name, type: item.type }))}
          onSaved={() => {
            setEditItem(null);
            fetchData();
          }}
          editItem={
            editItem
              ? {
                  _id: editItem._id,
                  amount: editItem.amount,
                  category: editItem.category,
                  type: editItem.type,
                  date: new Date(editItem.date).toISOString().slice(0, 10),
                  note: editItem.note,
                }
              : undefined
          }
          triggerLabel={editItem ? "Edit Transaction" : "Add Transaction"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <Input placeholder="Search note" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select
              multiple
              className="min-h-10 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              value={selectedCategories}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                setSelectedCategories(values);
              }}
            >
              {categories.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Grouped</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <div className="h-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
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
                        <tr key={item._id} className="border-b border-slate-200 dark:border-slate-800">
                          <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                          <td className="p-2">{item.category}</td>
                          <td className="p-2">{item.note || "-"}</td>
                          <td className="p-2">{item.type}</td>
                          <td className={`p-2 ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(item.amount, currency)}
                          </td>
                          <td className="p-2 space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditItem(item)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => remove(item._id)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <span className="text-sm">{page} / {pages}</span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardContent className="space-y-4 pt-4">
              {Object.entries(grouped).map(([month, items]) => {
                const subtotal = items.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0);
                return (
                  <div key={month}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{month}</h3>
                      <span className={subtotal >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800">
                          <div>{item.category} - {item.note || "-"}</div>
                          <div className={item.type === "income" ? "text-green-600" : "text-red-600"}>{formatCurrency(item.amount, currency)}</div>
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

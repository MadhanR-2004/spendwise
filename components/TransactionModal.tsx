"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type CategoryOption = { name: string; type: "income" | "expense" };

type TransactionForm = {
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note: string;
};

const initialState: TransactionForm = {
  amount: 0,
  type: "expense",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export function TransactionModal({
  triggerLabel = "Add Transaction",
  categories,
  onSaved,
  editItem,
}: {
  triggerLabel?: string;
  categories: CategoryOption[];
  onSaved: () => void;
  editItem?: { _id: string } & TransactionForm;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TransactionForm>(editItem ?? initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editItem ?? initialState);
    }
  }, [open, editItem]);

  const filteredCategories = categories.filter((item) => item.type === form.type);

  useEffect(() => {
    if (!filteredCategories.some((item) => item.name === form.category)) {
      setForm((prev) => ({ ...prev, category: filteredCategories[0]?.name ?? "" }));
    }
  }, [form.type, categories, form.category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      toast.error("Please provide amount, category, and date.");
      return;
    }

    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const endpoint = editItem ? `/api/transactions/${editItem._id}` : "/api/transactions";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save transaction");
      }

      toast.success(editItem ? "Transaction updated" : "Transaction added successfully!");
      setOpen(false);
      onSaved();
      if (!editItem) setForm(initialState);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 font-semibold text-zinc-900 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/20 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-zinc-100 dark:hover:bg-white/[0.1] dark:hover:border-white/[0.15]">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{editItem ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update your transaction details below." : "Enter the details of your new transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                form.type === "expense"
                  ? "bg-zinc-100 text-black shadow"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
              onClick={() => setForm({ ...form, type: "expense" })}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                form.type === "income"
                  ? "bg-zinc-100 text-black shadow"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
              onClick={() => setForm({ ...form, type: "income" })}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <Select
              className="w-full h-10 border rounded-md px-3 bg-background"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={filteredCategories.map((item) => ({ value: item.name, label: item.name }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Input
              placeholder="What was this for?"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editItem ? "Save Changes" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

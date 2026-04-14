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
  category: "Food & Dining",
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
  }, [form.type, filteredCategories, form.category]);

  const submit = async () => {
    if (!form.amount || !form.category || !form.date) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    const method = editItem ? "PUT" : "POST";
    const endpoint = editItem ? `/api/transactions/${editItem._id}` : "/api/transactions";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      toast.error("Failed to save transaction");
      return;
    }

    toast.success(editItem ? "Transaction updated" : "Transaction added");
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>Fill the transaction details and save.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
          />
          <Select
            value={form.type}
            onChange={(value) => setForm((prev) => ({ ...prev, type: value as "income" | "expense" }))}
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ]}
          />
          <Select
            value={form.category}
            onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
            options={filteredCategories.map((item) => ({ value: item.name, label: item.name }))}
          />
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <Input
            placeholder="Note / description"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
          <Button className="w-full" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

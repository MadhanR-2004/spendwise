"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type BudgetForm = {
  name: string;
  amount: number;
  period: "weekly" | "monthly";
  category: string | null;
  color: string;
  alertThreshold: number;
};

const defaultForm: BudgetForm = {
  name: "",
  amount: 0,
  period: "monthly",
  category: null,
  color: "#6366f1",
  alertThreshold: 80,
};

export function BudgetModal({
  trigger,
  onSaved,
  editItem,
  categories,
}: {
  trigger: React.ReactNode;
  onSaved: () => void;
  editItem?: { _id: string } & BudgetForm;
  categories: { name: string; type: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BudgetForm>(editItem ?? defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editItem ?? defaultForm);
  }, [open, editItem]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.name) {
      toast.error("Please provide a name and amount.");
      return;
    }

    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const endpoint = editItem
        ? `/api/budgets/${editItem._id}`
        : "/api/budgets";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save budget");
      }

      toast.success(editItem ? "Budget updated" : "Budget created!");
      setOpen(false);
      onSaved();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save budget"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editItem ? "Edit Budget" : "Create Budget"}
          </DialogTitle>
          <DialogDescription>
            Set spending limits to stay on track.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Budget Name</label>
            <Input
              placeholder="e.g. Monthly Food Budget"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Limit Amount</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="5000"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Period</label>
              <Select
                value={form.period}
                onChange={(value) =>
                  setForm({
                    ...form,
                    period: value as "weekly" | "monthly",
                  })
                }
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category (optional)</label>
            <Select
              value={form.category ?? "__overall__"}
              onChange={(value) => {
                const cat = value === "__overall__" ? null : value;
                setForm({
                  ...form,
                  category: cat,
                  name: cat ?? form.name,
                });
              }}
              options={[
                { value: "__overall__", label: "Overall (all expenses)" },
                ...expenseCategories.map((c) => ({
                  value: c.name,
                  label: c.name,
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Alert at %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.alertThreshold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    alertThreshold: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editItem
                  ? "Save Changes"
                  : "Create Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

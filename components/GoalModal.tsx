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

type GoalForm = {
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  color: string;
};

const defaultForm: GoalForm = {
  name: "",
  targetAmount: 0,
  savedAmount: 0,
  deadline: "",
  color: "#8b5cf6",
};

export function GoalModal({
  trigger,
  onSaved,
  editItem,
}: {
  trigger: React.ReactNode;
  onSaved: () => void;
  editItem?: { _id: string } & GoalForm;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GoalForm>(editItem ?? defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editItem ?? defaultForm);
  }, [open, editItem]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) {
      toast.error("Please provide a name and target amount.");
      return;
    }

    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const endpoint = editItem
        ? `/api/goals/${editItem._id}`
        : "/api/goals";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save goal");
      }

      toast.success(editItem ? "Goal updated" : "Goal created!");
      setOpen(false);
      onSaved();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save goal"
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
            {editItem ? "Edit Goal" : "Create Savings Goal"}
          </DialogTitle>
          <DialogDescription>
            Set a target and track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Goal Name</label>
            <Input
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="50000"
                value={form.targetAmount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetAmount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Already Saved</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.savedAmount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    savedAmount: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Deadline (optional)
              </label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm({ ...form, deadline: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm({ ...form, color: e.target.value })
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
                  : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

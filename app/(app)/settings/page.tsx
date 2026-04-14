"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CURRENCIES, DEFAULT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

type CustomCategory = {
  _id: string;
  name: string;
  color: string;
  type: "income" | "expense";
};

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#14b8a6", type: "expense" as "income" | "expense" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const load = async () => {
    const [sessionRes, categoryRes] = await Promise.all([fetch("/api/auth/session"), fetch("/api/categories")]);
    const session = await sessionRes.json();
    const categories = await categoryRes.json();
    setName(session?.user?.name ?? "");
    setEmail(session?.user?.email ?? "");
    setCurrency(session?.user?.currency ?? "INR");
    setCustomCategories(categories ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateProfile = async () => {
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currency }),
    });
    if (!res.ok) return toast.error("Failed to update profile");
    toast.success("Profile updated");
  };

  const changePassword = async () => {
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) return toast.error("Failed to update password");
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed");
  };

  const addCategory = async () => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });
    if (!res.ok) return toast.error("Failed to add category");
    toast.success("Category added");
    setNewCategory({ name: "", color: "#14b8a6", type: "expense" });
    load();
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete category");
    toast.success("Category deleted");
    load();
  };

  const deleteAllData = async () => {
    const confirmed = window.confirm("Delete all transactions and custom categories?");
    if (!confirmed) return;
    const res = await fetch("/api/user", { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete data");
    toast.success("All data deleted");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
          <Input value={email} readOnly placeholder="Email" />
          <Select
            value={currency}
            onChange={setCurrency}
            options={CURRENCIES.map((code) => ({ value: code, label: code }))}
          />
          <Button onClick={updateProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button onClick={changePassword}>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Category Management</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Category name" value={newCategory.name} onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))} />
            <Input type="color" value={newCategory.color} onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))} />
            <Select
              value={newCategory.type}
              onChange={(value) => setNewCategory((prev) => ({ ...prev, type: value as "income" | "expense" }))}
              options={[{ value: "expense", label: "Expense" }, { value: "income", label: "Income" }]}
            />
            <Button onClick={addCategory}>Add Category</Button>
          </div>

          <div className="space-y-2">
            {[...DEFAULT_CATEGORIES.map((item) => ({ ...item, _id: item.name })), ...customCategories].map((category) => {
              const isDefault = DEFAULT_CATEGORIES.some((item) => item.name === category.name);
              return (
                <div key={category._id} className="flex items-center justify-between rounded-md border border-slate-200 p-2 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                    <span>{category.name}</span>
                    <span className="text-slate-500">{category.type}</span>
                  </div>
                  {!isDefault && (
                    <Button variant="destructive" size="sm" onClick={() => deleteCategory(category._id)}>Delete</Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
        <CardContent>
          <a href="/api/transactions/export">
            <Button variant="outline">Export CSV</Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={deleteAllData}>Delete all data</Button>
        </CardContent>
      </Card>
    </div>
  );
}

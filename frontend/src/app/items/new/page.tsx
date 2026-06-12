"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export default function NewItemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (typeof window !== "undefined" && !isAuthenticated()) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/items", {
        title,
        description: description || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        dailyPrice: dailyPrice ? Number(dailyPrice) : undefined,
        depositAmount: depositAmount ? Number(depositAmount) : undefined,
      });
      if (res.data.success) {
        router.push(`/items/${res.data.data.id}`);
      } else {
        setError(res.data.message || "Failed to create item");
      }
    } catch {
      setError("Failed to create item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900">List a New Item</h1>
        <p className="mt-1 text-sm text-stone-600">Share a tool or piece of equipment with your community.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cordless Drill" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the item, condition, and what's included..."
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Daily price ($)" type="number" min="0" step="0.01" value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} placeholder="0.00" />
            <Input label="Deposit ($)" type="number" min="0" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a category</option>
              {["Tools", "Electronics", "Outdoor & Camping", "Sports & Fitness", "Kitchen & Dining", "Gardening"].map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" loading={loading} className="w-full">Create Listing</Button>
        </form>
      </main>
    </>
  );
}

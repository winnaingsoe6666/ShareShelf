"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, FileText, DollarSign, FolderTree, Image } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Category } from "@/types";

export default function NewItemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => setCatError("Failed to load categories. Check your connection."))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/items", {
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
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-purple-900">List a New Item</h1>
              <p className="mt-1 text-stone-600">Share a tool or piece of equipment with your community.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-purple-200 shadow-md p-6 sm:p-8 space-y-8">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Section: Item Details */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-purple-800">
              <FileText className="h-5 w-5 text-purple-500" />
              Item Details
            </h2>
            <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cordless Drill" required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-purple-800">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the item, condition, and what's included..."
                className="block w-full rounded-lg border border-purple-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Section: Pricing */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-purple-800">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Daily price ($)" type="number" min="0" step="0.01" value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} placeholder="0.00" />
              <Input label="Deposit ($)" type="number" min="0" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          {/* Section: Category */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-purple-800">
              <FolderTree className="h-5 w-5 text-purple-500" />
              Category
            </h2>
            <div className="space-y-1">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full rounded-lg border border-purple-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <option value="">Select a category</option>
                {catLoading ? (
                  <option disabled>Loading categories...</option>
                ) : catError ? (
                  <option disabled className="text-red-500">{catError}</option>
                ) : categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Section: Image Upload (placeholder) */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-purple-800">
              <Image className="h-5 w-5 text-purple-500" />
              Images
            </h2>
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/50 p-8 text-center transition-colors hover:border-purple-400 hover:bg-purple-50">
              <Image className="h-10 w-10 text-purple-300 mb-3" />
              <p className="text-sm font-medium text-purple-700">Image upload coming soon</p>
              <p className="text-xs text-stone-500 mt-1">You&apos;ll be able to add photos of your item</p>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">Create Listing</Button>
        </form>
      </main>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ItemCard from "@/components/items/ItemCard";
import Spinner from "@/components/ui/Spinner";
import api from "@/lib/api";
import type { Item, Category } from "@/types";

export default function BrowseItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/items").catch(() => ({ data: { data: [] } })),
      api.get("/categories").catch(() => ({ data: { data: [] } })),
    ]).then(([itemsRes, catRes]) => {
      setItems(itemsRes.data.data?.content ?? []);
      setCategories(catRes.data.data ?? []);
    }).catch(() => setError("Failed to load items"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || item.categoryId?.toString() === selectedCategory;
    return matchSearch && matchCategory && item.status === "available";
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-stone-900">Browse Items</h1>
          <Link
            href="/items/new"
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-purple-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 sm:max-w-xs transition-colors duration-200"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block rounded-lg border border-purple-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Items grid */}
        <div className="mt-6">
          {loading ? (
            <Spinner className="py-16" />
          ) : error ? (
            <p className="py-16 text-center text-stone-500">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-stone-500">
              No items found. Try a different search or{" "}
              <Link href="/items/new" className="text-purple-600 hover:underline">add one</Link>.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <ItemCard item={item} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

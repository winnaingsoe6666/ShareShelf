"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Wrench,
  Zap,
  Flower2,
  Palette,
  BookOpen,
  Music,
  Briefcase,
  Home,
  Grid3X3,
  Tag,
  Search,
  SearchX,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ItemCard from "@/components/items/ItemCard";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Item, Category } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  Tools: <Wrench className="h-4 w-4" />,
  Electronics: <Zap className="h-4 w-4" />,
  Gardening: <Flower2 className="h-4 w-4" />,
  "Arts & Crafts": <Palette className="h-4 w-4" />,
  Books: <BookOpen className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  Office: <Briefcase className="h-4 w-4" />,
  "Home & Kitchen": <Home className="h-4 w-4" />,
};

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
    const matchCategory = !selectedCategory || item.categoryName === selectedCategory;
    return matchSearch && matchCategory && item.status === "available";
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero search section */}
        <div className="mb-8 rounded-2xl bg-white border border-purple-200 shadow-md p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-purple-900">Browse Tools</h1>
              <p className="mt-2 text-stone-600">Discover tools shared by your community</p>
            </div>
            <Link
              href="/items/new"
              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-lg border border-purple-200 pl-10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory("")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                !selectedCategory
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white border border-purple-200 text-stone-600 hover:bg-purple-50"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white border border-purple-200 text-stone-600 hover:bg-purple-50"
                }`}
              >
                {categoryIcons[cat.name] || <Tag className="h-3.5 w-3.5" />}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-purple-200 bg-white overflow-hidden">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-16 text-center text-stone-500">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <SearchX className="h-12 w-12 mx-auto mb-3 text-stone-300" />
              <p>
                No items found. Try a different search or{" "}
                <Link href="/items/new" className="text-purple-600 hover:underline">add one</Link>.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
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

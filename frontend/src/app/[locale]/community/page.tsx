"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Package,
  Users,
  ArrowRightLeft,
  Star,
  TrendingUp,
  Search,
  Plus,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ItemCard from "@/components/items/ItemCard";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import api from "@/lib/api";
import type { Item } from "@/types";

interface TopLender {
  userId: number;
  name: string;
  itemCount: number;
  trustScore: number;
}

interface CommunityStats {
  totalItems: number;
  totalMembers: number;
  activeBorrows: number;
  recentItems: Item[];
  topLenders: TopLender[];
}

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

export default function CommunityPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/community/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => setError("Failed to load community stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-white border border-purple-200 shadow-md p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-purple-900">Community Dashboard</h1>
              <p className="mt-2 text-stone-600">See what&apos;s happening in your neighborhood tool library</p>
            </div>
            <Link
              href="/items"
              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Browse Tools
            </Link>
          </div>
        </div>

        {loading ? (
          <>
            {/* Stats skeleton */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-purple-200 bg-white p-6 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-3 rounded-full" />
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-3 w-20 mx-auto mt-1" />
                </div>
              ))}
            </div>
            {/* Recent items skeleton */}
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-purple-200 bg-white overflow-hidden">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="py-16 text-center text-stone-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-stone-300" />
            <p>{error}</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <Card className="p-6 text-center">
                <Package className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-purple-900">
                  <AnimatedCounter end={stats.totalItems} />
                </p>
                <p className="mt-1 text-sm text-stone-500">Total Items</p>
              </Card>
              <Card className="p-6 text-center">
                <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-purple-900">
                  <AnimatedCounter end={stats.totalMembers} />
                </p>
                <p className="mt-1 text-sm text-stone-500">Community Members</p>
              </Card>
              <Card className="p-6 text-center">
                <ArrowRightLeft className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-purple-900">
                  <AnimatedCounter end={stats.activeBorrows} />
                </p>
                <p className="mt-1 text-sm text-stone-500">Active Borrows</p>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Recent Items */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-purple-900">Recently Added</h2>
                  <Link href="/items" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">
                    View all
                  </Link>
                </div>
                {stats.recentItems.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 rounded-xl border border-purple-100 bg-white">
                    <Package className="h-10 w-10 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">No items available yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {stats.recentItems.map((item) => (
                      <Link key={item.id} href={`/items/${item.id}`}>
                        <ItemCard item={item} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Lenders */}
              <div>
                <h2 className="font-heading text-xl font-semibold text-purple-900 mb-4">Top Sharers</h2>
                {stats.topLenders.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 rounded-xl border border-purple-100 bg-white">
                    <Star className="h-10 w-10 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">No lenders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topLenders.map((lender, index) => (
                      <Card key={lender.userId} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0 ? "bg-amber-100 text-amber-700" :
                            index === 1 ? "bg-stone-200 text-stone-600" :
                            index === 2 ? "bg-amber-50 text-amber-600" :
                            "bg-purple-100 text-purple-600"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-stone-900 truncate">{lender.name}</p>
                            <p className="text-xs text-stone-500">{lender.itemCount} items shared</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium text-stone-700">{Number(lender.trustScore).toFixed(1)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/items"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-all duration-200 hover:-translate-y-px"
              >
                <Search className="h-4 w-4" />
                Browse All Tools
              </Link>
              <Link
                href="/items/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-purple-600 bg-white px-6 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:-translate-y-px"
              >
                <Plus className="h-4 w-4" />
                Share a Tool
              </Link>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}

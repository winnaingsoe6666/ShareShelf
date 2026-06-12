"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import type { Item, BorrowRequest, Review } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const user = getUser();
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.push("/login");
      return;
    }
    Promise.all([
      api.get("/api/items").catch(() => ({ data: { data: [] } })),
      api.get(`/api/review/user/${user?.id}`).catch(() => ({ data: { data: [] } })),
    ]).then(([itemsRes, reviewsRes]) => {
      setItems((itemsRes.data.data ?? []).filter((i: Item) => i.ownerId === user?.id));
      setReviews(reviewsRes.data.data ?? []);
    }).finally(() => setLoading(false));
  }, [router, user?.id]);

  if (loading) return <><Navbar /><Spinner className="py-24" /></>;
  if (!user) return <><Navbar /><p className="py-24 text-center text-stone-500">Not logged in</p></>;

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
                <p className="text-sm text-stone-500">{user.email}</p>
                {user.community && (
                  <p className="text-sm text-stone-500">{user.community}</p>
                )}
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  Trust Score: {user.trustScore.toFixed(1)} / 5.0
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>Log Out</Button>
          </div>
        </Card>

        {/* My Items */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">My Items ({items.length})</h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">You haven&apos;t listed any items yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <Card key={item.id} className="p-4" onClick={() => router.push(`/items/${item.id}`)}>
                  <h3 className="font-medium text-stone-900 truncate">{item.title}</h3>
                  <p className="mt-1 text-xs text-stone-500 capitalize">{item.status}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-900">{rev.reviewerName}</span>
                    <span className="text-sm text-amber-600">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                  </div>
                  {rev.comment && <p className="mt-1 text-sm text-stone-600">{rev.comment}</p>}
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

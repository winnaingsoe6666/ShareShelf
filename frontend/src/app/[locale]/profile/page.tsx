"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Package, Star, MessageSquare, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { useTranslations } from "next-intl";
import { getUser, clearAuth } from "@/lib/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import type { Item, Review } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const user = getUser();
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    Promise.all([
      api.get("/items").catch(() => ({ data: { data: [] } })),
      api.get(`/review/user/${user?.id}`).catch(() => ({ data: { data: [] } })),
    ]).then(([itemsRes, reviewsRes]) => {
      setItems((itemsRes.data.data?.content ?? []).filter((i: Item) => i.ownerId === user?.id));
      setReviews(reviewsRes.data.data ?? []);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-purple-200 bg-white p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto mt-1" />
            </div>
          ))}
        </div>
        {/* Profile card skeleton */}
        <div className="rounded-xl border border-purple-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        {/* Items section skeleton */}
        <div className="mt-8 space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-purple-200 bg-white p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
  if (!user) return <><Navbar /><p className="py-24 text-center text-stone-500">{t("profilePage.notLoggedIn")}</p></>;

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <AuthGuard>
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Package className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-900">{items.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">{t("profilePage.itemsListed")}</p>
          </Card>
          <Card className="p-4 text-center">
            <Star className="h-5 w-5 text-amber-500 mx-auto mb-1 fill-amber-500" />
            <p className="text-2xl font-bold text-purple-900">{user.trustScore.toFixed(1)}</p>
            <p className="text-xs text-stone-500 mt-0.5">{t("profilePage.trustScore")}</p>
          </Card>
          <Card className="p-4 text-center">
            <MessageSquare className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-900">{reviews.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">{t("profilePage.reviews")}</p>
          </Card>
        </div>

        {/* Profile */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-purple-900">{user.name}</h1>
                <p className="text-sm text-stone-500">{user.email}</p>
                {user.community && (
                  <p className="text-sm text-stone-500 inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.community}
                  </p>
                )}
                {/* Trust score star gauge */}
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(user.trustScore)
                          ? "text-amber-500 fill-amber-500"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-purple-900">{user.trustScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>Log Out</Button>
          </div>
        </Card>

        {/* My Items */}
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold text-purple-900">{t("profilePage.myItems")} ({items.length})</h2>
          {items.length === 0 ? (
            <div className="mt-6 text-center text-stone-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm">{t("profilePage.noItems")}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <Card key={item.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => router.push(`/items/${item.id}`)}>
                  <h3 className="font-medium text-stone-900 truncate">{item.title}</h3>
                  <p className="mt-1 text-xs text-stone-500 capitalize">{item.status}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold text-purple-900">{t("profilePage.reviews")} ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="mt-6 text-center text-stone-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm">{t("profilePage.noReviews")}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((rev) => (
                <Card key={rev.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-900">{rev.reviewerName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= rev.rating ? "text-amber-500 fill-amber-500" : "text-stone-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="mt-1 text-sm text-stone-600">{rev.comment}</p>}
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
    </AuthGuard>
  );
}

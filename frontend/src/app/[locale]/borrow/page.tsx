"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Package, User, Calendar, Clock, Inbox, CheckCircle2, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { useTranslations } from "next-intl";
import { getUser, isAuthenticated } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { BorrowRequest } from "@/types";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  pending: "warning",
  approved: "info",
  rejected: "danger",
  returned: "success",
  cancelled: "default",
};

export default function BorrowPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"borrowed" | "lent">("borrowed");
  const [error, setError] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");
  const [confirmedAction, setConfirmedAction] = useState<number | null>(null);
  const t = useTranslations();

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.get("/borrow")
      .then((res) => setRequests(res.data.data?.content ?? []))
      .catch(() => {
        setError(t("borrowPage.failedToLoad"));
      })
      .finally(() => setLoading(false));
  }, [router, t]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  useEffect(() => {
    if (confirmedAction !== null) {
      const timer = setTimeout(() => setConfirmedAction(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [confirmedAction]);

  const handleAction = async (id: number, action: "approve" | "reject" | "return") => {
    try {
      await api.put(`/borrow/${id}/${action}`);
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const newStatus: Record<string, "approved" | "rejected" | "returned"> = {
            approve: "approved",
            reject: "rejected",
            return: "returned",
          };
          return { ...r, status: newStatus[action] ?? r.status };
        })
      );
      setConfirmedAction(id);
    } catch {
      setActionError(`Failed to ${action} request. Please try again.`);
    }
  };

  const user = getUser();
  const filtered = tab === "borrowed"
    ? requests.filter((r) => r.borrowerId === user?.id)
    : requests.filter((r) => r.ownerId === user?.id);

  if (loading) return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="h-9 w-48 mb-6" />
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-purple-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-purple-900">{t("borrowPage.title")}</h1>

        <div className="mt-6 flex gap-2 border-b border-purple-200">
          {(["borrowed", "lent"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === tabKey
                  ? "border-b-2 border-purple-600 text-purple-700"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {tabKey === "borrowed" ? t("borrowPage.borrowing") : t("borrowPage.lending")}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {actionError && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
        )}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <Inbox className="h-12 w-12 mx-auto mb-3 text-stone-300" />
              <p>{tab === "borrowed" ? t("borrowPage.noBorrowing") : t("borrowPage.noLending")}</p>
            </div>
          ) : (
            filtered.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-stone-400 shrink-0" />
                      <h3 className="font-semibold text-stone-900 truncate">{req.itemTitle}</h3>
                      <Badge variant={statusVariant[req.status] || "default"}>{req.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      <User className="h-4 w-4 inline mr-1.5 text-stone-400" />
                      {tab === "borrowed" ? `${t("borrow.owner")}: ${req.ownerName}` : `${t("borrower")}: ${req.borrowerName}`}
                    </p>
                    {req.startDate && (
                      <p className="text-sm text-stone-500">
                        <Calendar className="h-4 w-4 inline mr-1.5 text-stone-400" />
                        {formatDate(req.startDate)} — {formatDate(req.endDate)}
                      </p>
                    )}
                    {req.message && (
                      <p className="mt-2 text-sm text-stone-600 italic">&ldquo;{req.message}&rdquo;</p>
                    )}
                    <p className="mt-1 text-xs text-stone-400">
                      <Clock className="h-4 w-4 inline mr-1.5 text-stone-400" />
                      {t("borrowPage.requestedOn")} {formatDate(req.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        const otherUserId = tab === "borrowed" ? req.ownerId : req.borrowerId;
                        router.push(`/messages?itemId=${req.itemId}&userId=${otherUserId}`);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                      aria-label={t("borrowPage.chat")}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                    {confirmedAction === req.id ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <>
                        {tab === "lent" && req.status === "pending" && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleAction(req.id, "approve")}>{t("borrow.approve")}</Button>
                            <Button size="sm" variant="danger" onClick={() => handleAction(req.id, "reject")}>{t("borrow.reject")}</Button>
                          </>
                        )}
                        {tab === "lent" && req.status === "approved" && (
                          <Button size="sm" variant="primary" onClick={() => handleAction(req.id, "return")}>{t("borrow.markReturned")}</Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}

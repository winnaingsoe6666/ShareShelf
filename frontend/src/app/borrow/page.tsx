"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
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

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.get("/borrow")
      .then((res) => setRequests(res.data.data?.content ?? []))
      .catch(() => {
        setError("Failed to load borrow requests. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

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
    } catch {
      setActionError(`Failed to ${action} request. Please try again.`);
    }
  };

  const user = getUser();
  const filtered = tab === "borrowed"
    ? requests.filter((r) => r.borrowerId === user?.id)
    : requests.filter((r) => r.ownerId === user?.id);

  if (loading) return <><Navbar /><Spinner className="py-24" /></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900">My Borrows</h1>

        <div className="mt-6 flex gap-2 border-b border-purple-200">
          {(["borrowed", "lent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-purple-600 text-purple-700"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t === "borrowed" ? "Items I&apos;m Borrowing" : "Items I&apos;m Lending"}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {actionError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
        )}

        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-stone-500">No requests found.</p>
          ) : (
            filtered.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{req.itemTitle}</h3>
                      <Badge variant={statusVariant[req.status] || "default"}>{req.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {tab === "borrowed" ? `Owner: ${req.ownerName}` : `Borrower: ${req.borrowerName}`}
                    </p>
                    {req.startDate && (
                      <p className="text-sm text-stone-500">{formatDate(req.startDate)} — {formatDate(req.endDate)}</p>
                    )}
                    {req.message && (
                      <p className="mt-2 text-sm text-stone-600 italic">&ldquo;{req.message}&rdquo;</p>
                    )}
                    <p className="mt-1 text-xs text-stone-400">Requested {formatDate(req.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {tab === "lent" && req.status === "pending" && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => handleAction(req.id, "approve")}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => handleAction(req.id, "reject")}>Reject</Button>
                      </>
                    )}
                    {tab === "lent" && req.status === "approved" && (
                      <Button size="sm" variant="primary" onClick={() => handleAction(req.id, "return")}>Mark Returned</Button>
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

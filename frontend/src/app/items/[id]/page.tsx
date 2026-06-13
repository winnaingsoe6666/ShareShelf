"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { getUser, isAuthenticated } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Item } from "@/types";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [borrowMsg, setBorrowMsg] = useState("");
  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState("");
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  useEffect(() => {
    api.get(`/api/items/${id}`)
      .then((res) => setItem(res.data.data ?? res.data))
      .catch(() => setError("Item not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setBorrowError("");
    setBorrowing(true);
    try {
      await api.post("/borrow", {
        itemId: Number(id),
        message: borrowMsg || undefined,
      });
      setBorrowSuccess(true);
      setBorrowOpen(false);
    } catch {
      setBorrowError("Failed to submit borrow request");
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <><Navbar /><Spinner className="py-24" /></>;
  if (error || !item) return <><Navbar /><p className="py-24 text-center text-stone-500">{error || "Item not found"}</p></>;

  const user = getUser();
  const isOwner = user?.id === item.ownerId;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
            {item.imageUrls?.[0] ? (
              <img src={item.imageUrls[0]} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-300">
                <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-stone-900">{item.title}</h1>
              <Badge variant={item.status === "available" ? "success" : "warning"}>{item.status}</Badge>
            </div>

            {item.categoryName && (
              <p className="mt-2 text-sm text-stone-500">{item.categoryName}</p>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-sm text-stone-600">{item.description || "No description provided."}</p>
            </div>

            <div className="mt-6 space-y-3 rounded-lg bg-stone-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Daily price</span>
                <span className="font-semibold text-stone-900">{formatPrice(item.dailyPrice)}</span>
              </div>
              {item.depositAmount != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Deposit</span>
                  <span className="font-semibold text-stone-900">{formatPrice(item.depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Owner</span>
                <span className="font-semibold text-stone-900">{item.ownerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Listed</span>
                <span className="text-stone-900">{formatDate(item.createdAt)}</span>
              </div>
            </div>

            {!isOwner && item.status === "available" && (
              <Button className="mt-6 w-full" size="lg" onClick={() => setBorrowOpen(true)}>
                Request to Borrow
              </Button>
            )}
            {isOwner && (
              <p className="mt-4 text-center text-sm text-stone-500">This is your listing</p>
            )}
            {borrowSuccess && (
              <p className="mt-4 text-center text-sm text-emerald-600">Borrow request sent successfully!</p>
            )}
          </div>
        </div>

        <Modal open={borrowOpen} onClose={() => setBorrowOpen(false)} title="Request to Borrow">
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Request to borrow <strong>{item.title}</strong> from <strong>{item.ownerName}</strong>.
            </p>
            <Input
              label="Message (optional)"
              value={borrowMsg}
              onChange={(e) => setBorrowMsg(e.target.value)}
              placeholder="When do you need it? Any questions?"
            />
            {borrowError && <p className="text-sm text-red-600">{borrowError}</p>}
            <Button className="w-full" loading={borrowing} onClick={handleBorrow}>
              Send Request
            </Button>
          </div>
        </Modal>
      </main>
    </>
  );
}

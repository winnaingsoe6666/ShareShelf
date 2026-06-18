"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Image, Star, User, Shield, CheckCircle2 } from "lucide-react";
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
    api.get(`/items/${id}`)
      .then((res) => setItem(res.data.data))
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
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-purple-100">
            {item.imageUrls?.[0] ? (
              <img src={item.imageUrls[0]} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-purple-300">
                <Image className="h-20 w-20" />
                <p className="mt-2 text-sm text-purple-400">No image available</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between">
              <h1 className="font-heading text-2xl font-bold text-purple-900">{item.title}</h1>
              <Badge variant={item.status === "available" ? "success" : "warning"}>{item.status}</Badge>
            </div>

            {item.categoryName && (
              <p className="mt-2 text-sm text-stone-500">{item.categoryName}</p>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-sm text-stone-600">{item.description || "No description provided."}</p>
            </div>

            {/* Item Details Card */}
            <div className="mt-6 rounded-lg border border-purple-200 p-5 space-y-3">
              <h2 className="font-heading text-lg font-semibold text-purple-800 mb-1">Item Details</h2>
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
                <span className="font-semibold text-stone-900 inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-stone-400" />
                  {item.ownerName}
                </span>
              </div>
              {/* Trust score indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-medium text-stone-700">{item.ownerTrustScore.toFixed(1)}</span>
                <span className="text-xs text-stone-400">owner trust score</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Listed</span>
                <span className="text-stone-900">{formatDate(item.createdAt)}</span>
              </div>
            </div>

            {!isOwner && item.status === "available" && (
              <div className="mt-6">
                <Button className="w-full" size="lg" onClick={() => setBorrowOpen(true)}>
                  Request to Borrow
                </Button>
                {item.depositAmount != null && (
                  <p className="mt-3 text-xs text-stone-500 text-center">
                    <Shield className="inline h-3.5 w-3.5 mr-1" />
                    A ${item.depositAmount.toFixed(2)} deposit will be held until return
                  </p>
                )}
              </div>
            )}
            {isOwner && (
              <p className="mt-4 text-center text-sm text-stone-500">This is your listing</p>
            )}
            {borrowSuccess && (
              <p className="mt-4 text-center text-sm text-green-600 inline-flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Borrow request sent successfully!
              </p>
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

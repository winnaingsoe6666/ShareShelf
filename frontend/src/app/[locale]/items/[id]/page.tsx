"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Image, Star, User, Shield, CheckCircle2, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ImageUpload from "@/components/ui/ImageUpload";
import ChatWindow from "@/components/chat/ChatWindow";
import api from "@/lib/api";
import { getUser, isAuthenticated } from "@/lib/auth";
import { useChatSocket } from "@/lib/useChatSocket";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Item } from "@/types";

export default function ItemDetailPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [borrowMsg, setBorrowMsg] = useState("");
  const [borrowStartDate, setBorrowStartDate] = useState("");
  const [borrowEndDate, setBorrowEndDate] = useState("");
  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState("");
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hasBorrowRequest, setHasBorrowRequest] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentUser = getUser();
  const { sendMessage } = useChatSocket({
    userId: currentUser?.id ?? null,
    onMessage: () => {},
    onUnreadUpdate: () => {},
  });

  useEffect(() => {
    api.get(`/items/${id}`)
      .then((res) => setItem(res.data.data))
      .catch(() => setError(t("itemDetail.failedToLoad")))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if current user has a borrow request for this item
  useEffect(() => {
    if (!isAuthenticated()) return;
    api.get("/borrow", { params: { itemId: id } })
      .then((res) => {
        const requests = res.data.data?.content ?? [];
        const userHasRequest = requests.some(
          (r: { itemId: number; borrowerId: number }) =>
            r.itemId === Number(id) && r.borrowerId === currentUser?.id
        );
        setHasBorrowRequest(userHasRequest);
      })
      .catch(() => {});
  }, [id, currentUser?.id]);

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
        startDate: borrowStartDate || undefined,
        endDate: borrowEndDate || undefined,
      });
      setBorrowSuccess(true);
      setBorrowOpen(false);
    } catch {
      setBorrowError(t("itemDetail.requestFailed"));
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <><Navbar /><Spinner className="py-24" /></>;
  if (error || !item) return <><Navbar /><p className="py-24 text-center text-stone-500">{error || t("itemDetail.failedToLoad")}</p></>;

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
                  <span className="text-stone-600">{t("itemDetail.deposit")}</span>
                  <span className="font-semibold text-stone-900">{formatPrice(item.depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">{t("itemDetail.owner")}</span>
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
                <Button className="w-full" size="lg" onClick={() => { setBorrowOpen(true); setBorrowStartDate(""); setBorrowEndDate(""); setBorrowMsg(""); setBorrowError(""); }}>
                  {t("itemDetail.requestToBorrow")}
                </Button>
                {item.depositAmount != null && (
                  <p className="mt-3 text-xs text-stone-500 text-center">
                    <Shield className="inline h-3.5 w-3.5 mr-1" />
                    A ${item.depositAmount.toFixed(2)} deposit will be held until return
                  </p>
                )}
              </div>
            )}
            {!isOwner && hasBorrowRequest && (
              <div className="mt-4">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setShowChat(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("itemDetail.messageOwner")}
                </Button>
              </div>
            )}
            {isOwner && (
              <div className="mt-6 space-y-3">
                <h3 className="font-heading text-lg font-semibold text-purple-800">Manage Images</h3>
                <ImageUpload
                  images={item.imageUrls}
                  onUpload={async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await api.post(`/items/${id}/images`, formData, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    });
                    setItem(res.data.data);
                  }}
                  onRemove={async (url) => {
                    const encodedUrl = encodeURIComponent(url);
                    const res = await api.delete(`/items/${id}/images?url=${encodedUrl}`);
                    setItem(res.data.data);
                  }}
                  disabled={uploadingImages}
                  uploading={uploadingImages}
                  maxFiles={5}
                />
                <p className="text-center text-sm text-stone-500">This is your listing</p>
              </div>
            )}
            {borrowSuccess && (
              <p className="mt-4 text-center text-sm text-green-600 inline-flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {t("itemDetail.requestSent")}
              </p>
            )}
          </div>
        </div>

        <Modal open={borrowOpen} onClose={() => setBorrowOpen(false)} title={t("itemDetail.requestToBorrow")}>
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Request to borrow <strong>{item.title}</strong> from <strong>{item.ownerName}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Start date</label>
                <input
                  type="date"
                  value={borrowStartDate}
                  onChange={(e) => setBorrowStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">End date</label>
                <input
                  type="date"
                  value={borrowEndDate}
                  onChange={(e) => setBorrowEndDate(e.target.value)}
                  min={borrowStartDate || new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            {item.dailyPrice && borrowStartDate && borrowEndDate && (
              <p className="text-sm text-stone-600">
                Estimated cost: <span className="font-semibold text-purple-700">{formatPrice(item.dailyPrice * Math.max(1, Math.ceil((new Date(borrowEndDate).getTime() - new Date(borrowStartDate).getTime()) / 86400000)))}</span>
                <span className="text-stone-400"> ({Math.max(1, Math.ceil((new Date(borrowEndDate).getTime() - new Date(borrowStartDate).getTime()) / 86400000))} day{Math.ceil((new Date(borrowEndDate).getTime() - new Date(borrowStartDate).getTime()) / 86400000) !== 1 ? "s" : ""})</span>
              </p>
            )}
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

        <Modal open={showChat} onClose={() => setShowChat(false)} title={`Chat with ${item.ownerName}`}>
          <div className="h-[500px] -mx-6 -mb-6 flex flex-col">
            <ChatWindow
              itemId={item.id}
              otherUserId={item.ownerId}
              otherUserName={item.ownerName}
              itemTitle={item.title}
              itemImageUrl={item.imageUrls?.[0] ?? null}
              sendMessage={sendMessage}
            />
          </div>
        </Modal>
      </main>
    </>
  );
}

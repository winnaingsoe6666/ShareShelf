"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import type { Item } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function MapSearchPage() {
  const t = useTranslations();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState<number>(5000);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError("");

    const params: Record<string, string | number> = { size: 50 };

    if (userLat != null && userLng != null) {
      params.nearLat = userLat;
      params.nearLng = userLng;
      params.nearRadius = radius;
    }

    api
      .get("/items", { params })
      .then((res) => setItems(res.data.data?.content ?? []))
      .catch(() => setError(t("itemMap.errorLoading") ?? "Failed to load items"))
      .finally(() => setLoading(false));
  }, [userLat, userLng, radius, t]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLat(lat);
    setUserLng(lng);
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-purple-900 flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            {t("itemMap.title")}
          </h1>
          <p className="mt-2 text-stone-600">{t("itemMap.subtitle")}</p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={fetchItems}
              className="ml-auto text-sm underline hover:no-underline"
            >
              {t("common.retry") ?? "Retry"}
            </button>
          </div>
        )}

        {/* Loading overlay */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          )}
          <MapView
            items={items}
            radius={radius}
            onRadiusChange={setRadius}
            onLocationFound={handleLocationFound}
          />
        </div>
      </main>
    </>
  );
}
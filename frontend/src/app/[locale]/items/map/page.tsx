"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/api";
import type { Item } from "@/types";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function MapSearchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState<number>(5000);

  useEffect(() => {
    setLoading(true);
    setError("");

    const params: Record<string, string | number> = {};
    if (userLat != null && userLng != null) {
      params.nearLat = userLat;
      params.nearLng = userLng;
      params.nearRadius = radius;
    }
    params.size = 50;

    api.get("/items", { params })
      .then((res) => setItems(res.data.data?.content ?? []))
      .catch(() => setError("Failed to load items"))
      .finally(() => setLoading(false));
  }, [userLat, userLng, radius]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold text-purple-900 flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Search by Map
          </h1>
          <p className="mt-2 text-stone-600">Discover tools near you</p>
        </div>

        {loading ? (
          <div className="h-96 rounded-2xl bg-purple-100 animate-pulse flex items-center justify-center">
            <p className="text-purple-400">Loading map...</p>
          </div>
        ) : error ? (
          <p className="py-16 text-center text-stone-500">{error}</p>
        ) : (
          <MapView
            items={items}
            radius={radius}
            onRadiusChange={setRadius}
            onLocationFound={(lat, lng) => {
              setUserLat(lat);
              setUserLng(lng);
            }}
          />
        )}
      </main>
    </>
  );
}

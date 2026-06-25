"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L, { type LatLngExpression } from "leaflet";
import { Link } from "@/i18n/navigation";
import type { Item } from "@/types";
import { formatPrice } from "@/lib/utils";
import { formatDistance } from "@/lib/distance";
import { isAuthenticated } from "@/lib/auth";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const itemIcon = L.divIcon({
  html: '<div style="width:32px;height:32px;border-radius:50%;background:#7C3AED;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userLocationIcon = L.divIcon({
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 2px #3B82F6, 0 2px 6px rgba(0,0,0,0.3);"></div>',
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

interface MapViewProps {
  items: Item[];
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationFound: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: LatLngExpression = [16.84, 96.17];

function GeolocationHandler({
  onLocationFound,
  onUserPositionChange,
}: {
  onLocationFound: (lat: number, lng: number) => void;
  onUserPositionChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onLocationFound(latitude, longitude);
          onUserPositionChange(latitude, longitude);
          // Use setTimeout to ensure map is fully initialized before setView
          setTimeout(() => {
            try {
              map.setView([latitude, longitude], 14);
            } catch {
              // ignore if map not ready
            }
          }, 100);
        },
        () => { /* denied — stay at default center */ },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [map, onLocationFound, onUserPositionChange]);
  return null;
}

export default function MapView({
  items,
  radius,
  onRadiusChange,
  onLocationFound,
}: MapViewProps) {
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);
  const locatedItems = items.filter((i) => i.latitude != null && i.longitude != null);

  return (
    <div className="rounded-2xl border border-purple-200 overflow-hidden shadow-md">
      <div className="h-[70vh] w-full">
        <MapContainer center={DEFAULT_CENTER} zoom={14} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          <GeolocationHandler
            onLocationFound={onLocationFound}
            onUserPositionChange={(lat, lng) => setUserPosition([lat, lng])}
          />
          {isAuthenticated() && userPosition && (
            <Marker position={userPosition} icon={userLocationIcon}>
              <Popup>
                <p className="text-sm font-medium text-blue-700">Your location</p>
              </Popup>
            </Marker>
          )}
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
            {locatedItems.map((item) => (
              <Marker
                key={item.id}
                position={[item.latitude!, item.longitude!] as LatLngExpression}
                icon={itemIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <Link
                      href={`/items/${item.id}`}
                      className="font-semibold text-purple-900 hover:underline text-sm"
                    >
                      {item.title}
                    </Link>
                    {item.categoryName && (
                      <p className="text-xs text-stone-500 mt-0.5">{item.categoryName}</p>
                    )}
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {formatPrice(item.dailyPrice)}
                    </p>
                    {item.distance != null && (
                      <p className="text-xs text-purple-600 mt-1">
                        {formatDistance(item.distance)}
                      </p>
                    )}
                    <Link
                      href={`/items/${item.id}`}
                      className="inline-block mt-2 text-xs text-purple-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}

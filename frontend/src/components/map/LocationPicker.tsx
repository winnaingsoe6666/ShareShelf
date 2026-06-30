"use client";

import { useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, MapPinOff } from "lucide-react";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#7C3AED;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
}

const DEFAULT_CENTER: [number, number] = [16.84, 96.20]; // Yangon
const DEFAULT_ZOOM = 13;

function MapClickHandler({ onClick, disabled }: { onClick: (lat: number, lng: number) => void; disabled?: boolean }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (!disabled) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  onClear,
  error,
  disabled = false,
}: LocationPickerProps) {
  const hasPin = latitude != null && longitude != null;
  const center: [number, number] = hasPin ? [latitude!, longitude!] : DEFAULT_CENTER;

  const handleMarkerDrag = useCallback((e: L.LeafletEvent) => {
    if (disabled) return;
    const marker = e.target as L.Marker;
    const pos = marker.getLatLng();
    onChange(pos.lat, pos.lng);
  }, [onChange, disabled]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    onChange(lat, lng);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-purple-200 overflow-hidden">
        {!hasPin && (
          <p className="px-4 py-3 bg-purple-50 text-sm text-purple-700 border-b border-purple-200 flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            Click on the map to set the location
          </p>
        )}
        {error && (
          <p className="px-4 py-3 bg-red-50 text-sm text-red-700 border-b border-red-200">{error}</p>
        )}
        <div className="h-64 w-full sm:h-[300px]">
          <MapContainer
            center={center}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            scrollWheelZoom={!disabled}
            dragging={!disabled}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />
            <MapClickHandler onClick={handleMapClick} disabled={disabled} />
            {hasPin && (
              <Marker
                position={[latitude!, longitude!]}
                icon={pinIcon}
                draggable={!disabled}
                eventHandlers={{ dragend: handleMarkerDrag }}
              />
            )}
          </MapContainer>
        </div>
      </div>
      {hasPin && !disabled && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 cursor-pointer"
        >
          <MapPinOff className="h-3.5 w-3.5" />
          Remove pin
        </button>
      )}
      {!hasPin && !disabled && (
        <p className="text-xs text-stone-400">No location set — this item won&apos;t appear in distance searches</p>
      )}
    </div>
  );
}

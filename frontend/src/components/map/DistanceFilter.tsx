"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface DistanceFilterProps {
  onLocationChange: (lat: number, lng: number, radius: number) => void;
}

const RADIUS_PRESETS = [
  { value: 1000, label: "1 km" },
  { value: 3000, label: "3 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
];

export default function DistanceFilter({ onLocationChange }: DistanceFilterProps) {
  const [selectedRadius, setSelectedRadius] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);

  const handleGeolocate = () => {
    setLocating(true);
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocating(false);
          setGeoDenied(false);
          onLocationChange(latitude, longitude, selectedRadius ?? 3000);
        },
        () => {
          setLocating(false);
          setGeoDenied(true);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      setLocating(false);
      setGeoDenied(true);
    }
  };

  const handleRadiusSelect = (radius: number) => {
    setSelectedRadius(radius);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <MapPin className="h-4 w-4 text-stone-400" />
      <button
        type="button"
        onClick={handleGeolocate}
        disabled={locating || geoDenied}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
          geoDenied
            ? "bg-stone-100 border border-stone-200 text-stone-400"
            : "bg-purple-600 text-white hover:bg-purple-700"
        } disabled:opacity-50`}
      >
        <Navigation className="h-3.5 w-3.5" />
        {locating ? "Locating..." : geoDenied ? "Location unavailable" : "Near Me"}
      </button>

      <span className="text-stone-300">|</span>

      {RADIUS_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => handleRadiusSelect(preset.value)}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
            selectedRadius === preset.value
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white border border-purple-200 text-stone-500 hover:bg-purple-50"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

import { MapPin } from "lucide-react";
import { formatDistance } from "@/lib/distance";

interface DistanceBadgeProps {
  meters: number;
  className?: string;
}

export default function DistanceBadge({ meters, className = "" }: DistanceBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs text-stone-500 ${className}`}>
      <MapPin className="h-3 w-3" />
      <span>{formatDistance(meters)}</span>
    </span>
  );
}

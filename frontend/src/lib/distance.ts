export function formatDistance(meters: number): string {
  if (meters < 10) return "Nearby";
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

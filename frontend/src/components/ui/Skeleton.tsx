interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton-pulse rounded-lg bg-stone-200 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

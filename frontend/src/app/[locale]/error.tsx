"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 px-4">
      <h1 className="font-heading text-4xl font-bold text-purple-900">
        Something went wrong
      </h1>
      <p className="mt-4 text-stone-600 text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

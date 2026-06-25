"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 px-4">
      <h1 className="font-heading text-6xl font-bold text-purple-900">404</h1>
      <p className="mt-4 text-lg text-stone-600">
        Page not found
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}

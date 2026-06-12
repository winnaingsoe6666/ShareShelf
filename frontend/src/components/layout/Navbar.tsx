"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-700">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          ShareShelf
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/items" className="text-sm font-medium text-stone-600 hover:text-emerald-700">
            Browse
          </Link>
          {loggedIn ? (
            <>
              <Link href="/items/new" className="text-sm font-medium text-stone-600 hover:text-emerald-700">
                Add Item
              </Link>
              <Link href="/borrow" className="text-sm font-medium text-stone-600 hover:text-emerald-700">
                My Borrows
              </Link>
              <Link href="/profile" className="text-sm font-medium text-stone-600 hover:text-emerald-700">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="h-6 w-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-stone-200 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/items" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-stone-100">Browse</Link>
            {loggedIn ? (
              <>
                <Link href="/items/new" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-stone-100">Add Item</Link>
                <Link href="/borrow" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-stone-100">My Borrows</Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-stone-100">Profile</Link>
                <button onClick={handleLogout} className="rounded px-3 py-2 text-left text-sm hover:bg-stone-100">Log Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-stone-100">Log In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded bg-emerald-600 px-3 py-2 text-center text-sm text-white">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

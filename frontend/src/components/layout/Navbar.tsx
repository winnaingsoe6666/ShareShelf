"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Share2, X } from "lucide-react";
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
    <nav className="sticky top-0 z-40 border-b border-purple-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-purple-700">
          <Share2 className="h-7 w-7" />
          ShareShelf
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/items" className="text-sm font-medium text-stone-600 hover:text-purple-700">
            Browse
          </Link>
          {loggedIn ? (
            <>
              <Link href="/items/new" className="text-sm font-medium text-stone-600 hover:text-purple-700">
                Add Item
              </Link>
              <Link href="/borrow" className="text-sm font-medium text-stone-600 hover:text-purple-700">
                My Borrows
              </Link>
              <Link href="/profile" className="text-sm font-medium text-stone-600 hover:text-purple-700">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-purple-100 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-purple-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X className="h-6 w-6 text-stone-700" />
          ) : (
            <Menu className="h-6 w-6 text-stone-700" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-purple-200 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/items" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Browse</Link>
            {loggedIn ? (
              <>
                <Link href="/items/new" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Add Item</Link>
                <Link href="/borrow" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">My Borrows</Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Profile</Link>
                <button onClick={handleLogout} className="rounded px-3 py-2 text-left text-sm hover:bg-purple-100 transition-colors">Log Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Log In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded bg-green-600 px-3 py-2 text-center text-sm text-white">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

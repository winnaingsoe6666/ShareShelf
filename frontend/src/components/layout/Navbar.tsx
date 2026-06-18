"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Share2, X } from "lucide-react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();
  const loggedIn = isAuthenticated();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 py-1 ${
      isActive(path)
        ? "text-purple-700 font-semibold border-b-2 border-purple-600"
        : "text-stone-600 hover:text-purple-700"
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-purple-200 bg-purple-50/90 backdrop-blur supports-[backdrop-filter]:bg-purple-50/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-purple-700">
          <Share2 className="h-7 w-7" />
          <span className="font-display tracking-wide">ShareShelf</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/items" className={navLinkClass("/items")}>
            Browse
          </Link>
          {loggedIn ? (
            <>
              <Link href="/items/new" className={navLinkClass("/items/new")}>
                Add Item
              </Link>
              <Link href="/borrow" className={navLinkClass("/borrow")}>
                My Borrows
              </Link>
              <Link href="/profile" className={navLinkClass("/profile")}>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-purple-100 transition-colors"
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
        <button
          className="md:hidden cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-purple-700" />
          ) : (
            <Menu className="h-6 w-6 text-purple-700" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-slide-up border-t border-purple-200 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/items" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Browse</Link>
            {loggedIn ? (
              <>
                <Link href="/items/new" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Add Item</Link>
                <Link href="/borrow" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">My Borrows</Link>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Profile</Link>
                <button onClick={handleLogout} className="rounded px-3 py-2 text-left text-sm hover:bg-purple-100 transition-colors cursor-pointer">Log Out</button>
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

"use client";

import { Link } from "@/i18n/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Share2, X, Bell, Package, CheckCircle2, XCircle, RotateCcw, Star } from "lucide-react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import api from "@/lib/api";
import type { Notification } from "@/types";

const notificationIcons: Record<string, React.ReactNode> = {
  borrow_requested: <Package className="h-4 w-4 text-purple-500" />,
  borrow_approved: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  borrow_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  borrow_returned: <RotateCcw className="h-4 w-4 text-blue-500" />,
  review_received: <Star className="h-4 w-4 text-amber-500" />,
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const user = getUser();
  const loggedIn = isAuthenticated();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  const fetchUnreadCount = useCallback(() => {
    if (!loggedIn) return;
    api.get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.data?.count ?? 0))
      .catch(() => {});
  }, [loggedIn]);

  const fetchNotifications = useCallback(() => {
    if (!loggedIn) return;
    api.get("/notifications", { params: { size: 10 } })
      .then((res) => setNotifications(res.data.data?.content ?? []))
      .catch(() => {});
  }, [loggedIn]);

  // Poll unread count every 30s when logged in
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifToggle = () => {
    if (!notifOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
    setNotifOpen(!notifOpen);
  };

  const handleNotifClick = (notif: Notification) => {
    setNotifOpen(false);
    // Mark as read
    api.put(`/notifications/${notif.id}/read`).catch(() => {});
    setUnreadCount((c) => Math.max(0, c - 1));
    // Navigate based on type
    if (notif.relatedBorrowId) {
      router.push("/borrow");
    } else if (notif.type === "review_received") {
      router.push("/profile");
    } else if (notif.relatedItemId) {
      router.push(`/items/${notif.relatedItemId}`);
    }
  };

  const handleMarkAllRead = () => {
    api.put("/notifications/read-all")
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      })
      .catch(() => {});
  };

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

          {/* Language switcher */}
          <div className="flex items-center gap-1 border border-purple-200 rounded-lg p-0.5">
            <button
              onClick={() => router.replace(pathname, { locale: 'en' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'en' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => router.replace(pathname, { locale: 'my' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'my' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
            >
              မြန်မာ
            </button>
          </div>

          {loggedIn ? (
            <>
              <Link href="/community" className={navLinkClass("/community")}>
                Community
              </Link>
              <Link href="/items/new" className={navLinkClass("/items/new")}>
                Add Item
              </Link>
              <Link href="/borrow" className={navLinkClass("/borrow")}>
                My Borrows
              </Link>

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleNotifToggle}
                  className="relative cursor-pointer rounded-lg p-1.5 text-stone-600 hover:bg-purple-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-purple-200 bg-white shadow-xl animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100">
                      <h3 className="font-heading text-sm font-semibold text-purple-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-purple-600 hover:text-purple-800 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-stone-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors cursor-pointer ${
                              !notif.isRead ? "border-l-2 border-purple-500 bg-purple-50/50" : ""
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notificationIcons[notif.type] || <Bell className="h-4 w-4 text-stone-400" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm ${notif.isRead ? "text-stone-600" : "text-stone-900 font-medium"}`}>
                                {notif.message}
                              </p>
                              <p className="mt-0.5 text-xs text-stone-400">{timeAgo(notif.createdAt)}</p>
                            </div>
                            {!notif.isRead && (
                              <div className="mt-1.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                <Link href="/community" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm hover:bg-purple-100 transition-colors">Community</Link>
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

            {/* Language switcher */}
            <div className="flex items-center gap-1 border border-purple-200 rounded-lg p-0.5 self-start mt-1">
              <button
                onClick={() => { router.replace(pathname, { locale: 'en' }); setMobileOpen(false); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'en' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => { router.replace(pathname, { locale: 'my' }); setMobileOpen(false); }}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'my' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

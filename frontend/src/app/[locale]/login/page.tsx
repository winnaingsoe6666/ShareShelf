"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Library, ArrowLeft } from "lucide-react";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import CommunityQuotes from "@/components/ui/CommunityQuotes";
import api from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      router.push("/items");
    }
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        saveAuth(res.data.data);
        const returnUrl = searchParams.get("returnUrl");
        router.push(returnUrl || "/items");
      } else {
        setError(res.data.message || t("loginPage.failed"));
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        const status = axiosErr.response?.status;
        if (status === 429) {
          setError(t("loginPage.failed"));
        } else if (status === 401) {
          setError(axiosErr.response?.data?.message || t("loginPage.failed"));
        } else {
          setError(t("loginPage.failed"));
        }
      } else {
        setError(t("loginPage.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left Panel: Quote Showcase ── */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 flex items-center justify-center p-8 lg:p-16 min-h-[280px] lg:min-h-screen">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-400/10 rounded-full blur-2xl" />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]" />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Library className="w-7 h-7 text-white" />
            </div>
            <span className="font-display text-xl tracking-wide text-white/90">
              ShareShelf
            </span>
          </div>

          {/* Rotating Quote */}
          <CommunityQuotes />

          {/* Tagline */}
          <p className="mt-10 text-sm text-white/50 font-body tracking-wide">
            Community-powered tool sharing
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative">
        {/* Back to home link */}
        <Link
          href="/"
          className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-1.5 text-sm text-stone-400 hover:text-purple-600 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Mobile logo (hidden on lg+) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Library className="w-8 h-8 text-purple-600" />
            <span className="font-display text-lg tracking-wide text-purple-900">
              ShareShelf
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-stone-900">
              {t("loginPage.title")}
            </h1>
            <p className="mt-2 text-stone-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton text="Sign in with Google" />

          {/* Error from Google OAuth */}
          {searchParams.get("error") === "google_auth_failed" && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              Google sign-in failed. Please try again.
            </div>
          )}

          {/* General error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-stone-400">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-stone-500">
            {t("loginPage.noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-purple-700 hover:text-purple-800 transition-colors duration-200"
            >
              {t("loginPage.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Library } from "lucide-react";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import CommunityQuotes from "@/components/ui/CommunityQuotes";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      router.push("/items");
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-stone-50/50 relative overflow-hidden font-body">
      {/* ── Background Ambient Glows & Patterns ── */}
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.25] pointer-events-none" />
      
      {/* Soft color blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl mix-blend-multiply filter pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl mix-blend-multiply filter pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50/20 blur-3xl pointer-events-none" />

      {/* ── Main Glassmorphic Card ── */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl p-8 sm:p-12 transition-all duration-500 hover:shadow-purple-900/5 animate-slide-up z-10">
        
        {/* Brand Logo and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Library className="w-7 h-7 text-white" />
          </div>
          <span className="font-display text-2xl tracking-widest bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent font-medium">
            SHARE SHELF
          </span>
          <span className="text-[10px] uppercase tracking-widest text-purple-600/60 font-semibold mt-1.5">
            {locale === "my" ? "ရပ်ကွက်ကိရိယာမျှဝေခြင်း" : "Community Tool Library"}
          </span>
        </div>

        {/* Rotating Testimonials/Quotes container */}
        <div className="mb-8 p-5 rounded-2xl bg-purple-50/40 border border-purple-100/50 text-center relative overflow-hidden">
          <span className="absolute -top-1 left-3 text-5xl text-purple-200/40 font-serif pointer-events-none select-none">“</span>
          <CommunityQuotes locale={locale} variant="dark" />
        </div>

        {/* Card Header & Description */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-stone-900">
            {t("loginPage.title")}
          </h1>
          <p className="text-sm text-stone-500 mt-1.5">
            {locale === "my"
              ? "ဆက်လက်ဆောင်ရွက်ရန် သင့်အကောင့်သို့ ဝင်ရောက်ပါ"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <GoogleSignInButton
            text={
              locale === "my"
                ? "Google ဖြင့် ဝင်ရောက်ပါ"
                : "Sign in with Google"
            }
            className="border-stone-200 hover:border-purple-300 hover:bg-stone-50 shadow-sm"
          />

          {/* Error display */}
          {searchParams.get("error") === "google_auth_failed" && (
            <div className="rounded-xl bg-red-50/80 border border-red-100/80 px-4 py-3 text-xs text-red-700 text-center font-medium shadow-sm animate-fade-in">
              {locale === "my"
                ? "Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။"
                : "Google sign-in failed. Please try again."}
            </div>
          )}
        </div>

        {/* Register link */}
        <div className="mt-8 text-center text-sm text-stone-500">
          {t("loginPage.noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-purple-700 hover:text-purple-600 underline underline-offset-4 decoration-purple-200 hover:decoration-purple-500 transition-all duration-200"
          >
            {t("loginPage.register")}
          </Link>
        </div>
        
      </div>
    </div>
  );
}

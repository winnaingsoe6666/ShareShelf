"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Library } from "lucide-react";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import CommunityQuotes from "@/components/ui/CommunityQuotes";
import { isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [bgImage, setBgImage] = useState("/bk_images/bk_2.jpg");

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      router.push("/items");
    }
  }, [router]);

  useEffect(() => {
    const images = [
      "bk_1.jpg", "bk_2.jpg", "bk_3.jpg", "bk_4.jpg", "bk_5.jpg",
      "bk_6.jpg", "bk_7.jpg", "bk_8.jpg", "bk_9.jpg", "bk_91.jpg",
      "bk_92.jpg", "bk_93.jpg"
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(`/bk_images/${randomImage}`);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body">
      {/* ── Background Image & Dark Overlay ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <img
          src={bgImage}
          alt="Community Background"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* Soft, rich dark gradient overlay to ensure perfect text readability & visual depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/75 via-stone-950/65 to-indigo-950/70 mix-blend-multiply" />
      </div>

      {/* ── Main Glassmorphic Popup Card ── */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.30)] rounded-3xl p-8 sm:p-12 transition-all duration-500 hover:shadow-purple-500/10 hover:border-white/30 animate-slide-up z-10">
        
        {/* Brand Logo and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <Library className="w-7 h-7 text-white" />
          </div>
          <span className="font-display text-2xl tracking-widest text-white font-medium">
            SHARE SHELF
          </span>
          <span className="text-[10px] uppercase tracking-widest text-purple-200/80 font-bold mt-1.5">
            {locale === "my" ? "ရပ်ကွက်ကိရိယာမျှဝေခြင်း" : "Community Tool Library"}
          </span>
        </div>

        {/* Rotating Testimonials/Quotes container (Glass Variant) */}
        <div className="mb-8 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center relative overflow-hidden">
          <span className="absolute -top-1 left-3 text-5xl text-white/10 font-serif pointer-events-none select-none">“</span>
          <CommunityQuotes locale={locale} variant="light" />
        </div>

        {/* Card Header & Description */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-white">
            {t("registerPage.title")}
          </h1>
          <p className="text-sm text-stone-200 mt-1.5">
            {locale === "my"
              ? "သင့်လူမှုအသိုင်းအဝိုင်း ကိရိယာစာကြည့်တိုက်သို့ ပါဝင်ပါ"
              : "Join your community tool library"}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <GoogleSignInButton
            text={
              locale === "my"
                ? "Google ဖြင့် စာရင်းသွင်းပါ"
                : "Sign up with Google"
            }
            className="border-white/20"
          />

          {/* Error display */}
          {searchParams.get("error") === "google_auth_failed" && (
            <div className="rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-3 text-xs text-red-200 text-center font-medium shadow-sm animate-fade-in">
              {locale === "my"
                ? "Google ဖြင့် စာရင်းသွင်းခြင်း မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။"
                : "Google sign-up failed. Please try again."}
            </div>
          )}
        </div>

        {/* Login link */}
        <div className="mt-8 text-center text-sm text-stone-300">
          {t("registerPage.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-300 hover:text-purple-200 underline underline-offset-4 decoration-purple-400/50 hover:decoration-purple-200 transition-all duration-200"
          >
            {t("registerPage.login")}
          </Link>
        </div>
        
      </div>
    </div>
  );
}

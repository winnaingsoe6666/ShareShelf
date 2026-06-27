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

export default function LoginPage() {
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
      <div className="relative w-full max-w-sm bg-white/[0.05] backdrop-blur-md border border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.30)] rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:shadow-purple-500/10 hover:border-white/30 animate-slide-up z-10">
        
        {/* Brand Logo and Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg mb-2 transform hover:scale-105 transition-transform duration-300">
            <Library className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg tracking-widest text-white font-medium">
            SHARE SHELF
          </span>
          <span className="text-[9px] uppercase tracking-widest text-purple-200/80 font-bold mt-1">
            {locale === "my" ? "ရပ်ကွက်ကိရိယာမျှဝေခြင်း" : "Community Tool Library"}
          </span>
        </div>

        {/* Rotating Testimonials/Quotes container (Glass Variant) */}
        <div className="mb-5 p-4 rounded-xl bg-white/3 backdrop-blur-sm border border-white/10 text-center relative overflow-hidden">
          <span className="absolute -top-1 left-3 text-4xl text-white/10 font-serif pointer-events-none select-none">“</span>
          <CommunityQuotes locale={locale} variant="light" />
        </div>

        {/* Card Header & Description */}
        <div className="text-center mb-5">
          <h1 className="font-heading text-xl font-bold text-white">
            {t("loginPage.title")}
          </h1>
          <p className="text-xs text-stone-200 mt-1">
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
            className="border-white/20"
          />

          {/* Error display */}
          {searchParams.get("error") === "google_auth_failed" && (
            <div className="rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-3 text-xs text-red-200 text-center font-medium shadow-sm animate-fade-in">
              {locale === "my"
                ? "Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။"
                : "Google sign-in failed. Please try again."}
            </div>
          )}
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-stone-300">
          {t("loginPage.noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-purple-300 hover:text-purple-200 underline underline-offset-4 decoration-purple-400/50 hover:decoration-purple-200 transition-all duration-200"
          >
            {t("loginPage.register")}
          </Link>
        </div>
        
      </div>
    </div>
  );
}

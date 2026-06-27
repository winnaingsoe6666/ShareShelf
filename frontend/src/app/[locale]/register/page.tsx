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

export default function RegisterPage() {
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
          <CommunityQuotes locale={locale} />

          {/* Tagline */}
          <p className="mt-10 text-sm text-white/50 font-body tracking-wide">
            {locale === "my"
              ? "ဒီနေ့ပဲ သင့်အိမ်နီးချင်းတွေနဲ့ မျှဝေစပါ"
              : "Start sharing with your neighbors today"}
          </p>
        </div>
      </div>

      {/* ── Right Panel: Register Form ── */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
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
              {t("registerPage.title")}
            </h1>
            <p className="mt-2 text-stone-500">
              {locale === "my"
                ? "သင့်လူမှုအသိုင်းအဝိုင်း ကိရိယာစာကြည့်တိုက်သို့ ပါဝင်ပါ"
                : "Join your community tool library"}
            </p>
          </div>

          {/* Google Sign Up */}
          <GoogleSignInButton
            text={
              locale === "my"
                ? "Google ဖြင့် စာရင်းသွင်းပါ"
                : "Sign up with Google"
            }
          />

          {/* Error from Google OAuth */}
          {searchParams.get("error") === "google_auth_failed" && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {locale === "my"
                ? "Google ဖြင့် စာရင်းသွင်းခြင်း မအောင်မြင်ပါ။ ထပ်ကြိုးစားပါ။"
                : "Google sign-up failed. Please try again."}
            </div>
          )}

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-stone-500">
            {t("registerPage.haveAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-700 hover:text-purple-800 transition-colors duration-200"
            >
              {t("registerPage.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

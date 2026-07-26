"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  Share2,
  Search,
  Wrench,
  Cog,
  Hammer,
  PaintBucket,
  Ruler,
  Send,
  RotateCcw,
  Package,
  Users,
  ArrowRightLeft,
  Shield,
  Star,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CommunityQuotes from "@/components/ui/CommunityQuotes";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else { setCount(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const FALLBACK_STATS = { totalItems: 1250, totalMembers: 840, activeBorrows: 3200 };

export default function HomePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [loggedIn, setLoggedIn] = useState(false);
  const [communityStats, setCommunityStats] = useState(FALLBACK_STATS);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedIn(isAuthenticated());
    }
  }, []);

  useEffect(() => {
    api.get("/community/stats")
      .then((res) => {
        if (res.data?.data) {
          setCommunityStats({
            totalItems: res.data.data.totalItems,
            totalMembers: res.data.data.totalMembers,
            activeBorrows: res.data.data.activeBorrows,
          });
        }
        setIsLoadingStats(false);
      })
      .catch(() => {
         setStatsError(true);
         setIsLoadingStats(false);
      }); // use fallback stats on error
  }, []);
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-purple-50">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/uploads/sharing_tool.jpg')" }}
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 to-purple-50/60 backdrop-blur-[2px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-20 sm:pt-32 sm:pb-32 lg:pt-40 lg:pb-36 text-center">
            {/* Small badge/label above heading */}
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-md border border-purple-200 px-4 py-1.5 text-xs font-medium text-purple-700 mb-8 shadow-sm">
              <Share2 className="h-3.5 w-3.5" />
              {t("home.badge")}
            </p>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {t("home.hero.title")}{" "}
              <span className="text-emerald-600 drop-shadow-sm">{t("home.hero.highlight")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-700 leading-relaxed sm:text-xl">
              {t("home.hero.subtitle")}
            </p>

            {/* CTA: buttons for guests, quotes for logged-in users */}
            {loggedIn ? (
              <div className="mt-10 mx-auto w-full max-w-lg h-[180px] sm:h-[160px] p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-purple-200/50 text-center relative overflow-hidden shadow-lg flex flex-col justify-center transition-all duration-300 hover:shadow-xl">
                <span className="absolute -top-1 left-3 text-4xl text-[#fca3a0]/30 font-serif pointer-events-none select-none">“</span>
                <CommunityQuotes locale={locale} variant="sunset" />
              </div>
            ) : (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/items"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                >
                  <Search className="h-5 w-5" />
                  {t("home.hero.browseTools")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-600 bg-white/90 px-8 py-4 text-base font-semibold text-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-purple-50 hover:shadow-md active:scale-95"
                >
                  {t("home.hero.joinNow")}
                </Link>
              </div>
            )}

            {/* Floating tool icons */}
            <div className="mt-12 flex items-center justify-center gap-6 text-purple-300">
              <Wrench className="h-8 w-8 opacity-60" />
              <Cog className="h-8 w-8 opacity-40" />
              <Hammer className="h-8 w-8 opacity-60" />
              <PaintBucket className="h-8 w-8 opacity-40" />
              <Ruler className="h-8 w-8 opacity-60" />
            </div>
          </div>
        </section>

        {/* Hook / Share & Care message */}
        <section className="border-t border-purple-200 bg-purple-50 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-purple-900 sm:text-3xl">
              {t("home.hook.title")}
            </h2>
            <p className="mt-3 text-lg text-stone-600 leading-relaxed">
              {t("home.hook.desc")}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-purple-200 bg-white py-20 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-stone-900 sm:text-4xl lg:text-5xl">{t("home.howItWorks.title")}</h2>
              <p className="mt-4 text-lg text-stone-600 leading-relaxed">{t("home.howItWorks.subtitle")}</p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3 lg:gap-12">
              {[
                { icon: Search, tKey: "home.howItWorks.step1", color: "bg-purple-100 text-purple-700" },
                { icon: Send, tKey: "home.howItWorks.step2", color: "bg-emerald-100 text-emerald-700" },
                { icon: RotateCcw, tKey: "home.howItWorks.step3", color: "bg-purple-100 text-purple-700" },
              ].map(({ icon: Icon, tKey, color }) => (
                <div key={tKey} className="group rounded-3xl bg-stone-50 border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-white">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-bold text-stone-900">{t(`${tKey}.title`)}</h3>
                  <p className="mt-3 text-base text-stone-600 leading-relaxed">{t(`${tKey}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats section with animated counters */}
        <section className="bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-800 py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid gap-10 sm:grid-cols-3 text-center">
              {[
                { icon: Package, value: communityStats.totalItems, labelKey: "home.stats.itemsShared", suffix: "+" },
                { icon: Users, value: communityStats.totalMembers, labelKey: "home.stats.communityMembers", suffix: "+" },
                { icon: ArrowRightLeft, value: communityStats.activeBorrows, labelKey: "home.stats.successfulBorrows", suffix: "+" },
              ].map(({ icon: Icon, value, labelKey, suffix }) => (
                <div key={labelKey} className="text-white group">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                    <Icon className="h-8 w-8 text-purple-200" />
                  </div>
                  {isLoadingStats ? (
                    <div className="h-12 w-24 mx-auto bg-white/20 rounded animate-pulse"></div>
                  ) : statsError ? (
                    <p className="font-display text-2xl font-semibold sm:text-3xl text-purple-200">
                      Unavailable
                    </p>
                  ) : (
                    <p className="font-display text-5xl font-extrabold sm:text-6xl drop-shadow-md">
                      <AnimatedCounter end={value} suffix={suffix} />
                    </p>
                  )}
                  <p className="mt-3 text-purple-200 text-base font-medium tracking-wide">{t(labelKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built on Trust section */}
        <section className="border-t border-purple-200 bg-stone-50 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="font-heading text-3xl font-extrabold text-stone-900 sm:text-4xl lg:text-5xl">{t("home.trust.title")}</h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">{t("home.trust.subtitle")}</p>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                { icon: Shield, tKey: "home.trust.verified" },
                { icon: Star, tKey: "home.trust.reviews" },
                { icon: Users, tKey: "home.trust.local" },
              ].map(({ icon: Icon, tKey }) => (
                <div key={tKey} className="rounded-3xl border border-stone-200 bg-white p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-5">
                    <Icon className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stone-900">{t(`${tKey}.title`)}</h3>
                  <p className="mt-3 text-base text-stone-600 leading-relaxed">{t(`${tKey}.desc`)}</p>
                </div>
              ))}
            </div>

            {/* Testimonial placeholder */}
            <div className="mt-16 rounded-3xl bg-white border border-purple-100 p-10 sm:p-12 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 via-emerald-400 to-indigo-400"></div>
              <MessageSquare className="h-10 w-10 text-purple-200 mx-auto mb-6" />
              <p className="text-stone-800 text-xl sm:text-2xl italic max-w-2xl mx-auto font-medium leading-relaxed">
                &ldquo;{t("home.testimonial")}&rdquo;
              </p>
              <p className="mt-6 text-sm font-semibold text-stone-500 uppercase tracking-widest">{t("home.testimonialAuthor")}</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-white py-20 sm:py-28 text-center border-t border-stone-200">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-heading text-4xl font-extrabold text-stone-900 sm:text-5xl">
              {loggedIn
                ? locale === "my"
                  ? "ကိရိယာများ ရှာဖွေရန် အဆင်သင့်ဖြစ်ပြီလား?"
                  : "Ready to find your next tool?"
                : t("home.cta.title")}
            </h2>
            <p className="mt-5 text-xl text-stone-600 max-w-2xl mx-auto">
              {loggedIn
                ? locale === "my"
                  ? "သင့်အိမ်နီးချင်းတွေဆီကနေ ငှားယူနိုင်တဲ့ ကိရိယာတွေကို ရှာဖွေပါ"
                  : "Browse tools available from your neighbors"
                : t("home.cta.subtitle")}
            </p>
            <Link
              href={loggedIn ? "/items" : "/login"}
              className="mt-10 inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-xl active:scale-95"
            >
              {loggedIn
                ? locale === "my"
                  ? "ကိရိယာများ ရှာဖွေပါ"
                  : "Browse Tools"
                : t("home.cta.button")}
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useTranslations } from 'next-intl';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BookOpen, Shield, HelpCircle, ClipboardList, ArrowRight } from "lucide-react";

export default function ReadmePage() {
  const t = useTranslations();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-purple-900 sm:text-4xl">
            {t("readme.title")}
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t("readme.subtitle")}
          </p>
        </section>

        {/* Getting Started */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10">
          <h2 className="font-heading text-2xl font-bold text-purple-900 mb-6">
            {t("readme.gettingStarted.title")}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-purple-900">
                  {t("readme.gettingStarted.step1.title")}
                </h3>
                <p className="mt-1 text-stone-600 leading-relaxed">
                  {t("readme.gettingStarted.step1.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-purple-900">
                  {t("readme.gettingStarted.step2.title")}
                </h3>
                <p className="mt-1 text-stone-600 leading-relaxed">
                  {t("readme.gettingStarted.step2.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-purple-900">
                  {t("readme.gettingStarted.step3.title")}
                </h3>
                <p className="mt-1 text-stone-600 leading-relaxed">
                  {t("readme.gettingStarted.step3.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-purple-900">
                  {t("readme.gettingStarted.step4.title")}
                </h3>
                <p className="mt-1 text-stone-600 leading-relaxed">
                  {t("readme.gettingStarted.step4.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-purple-900">
                  {t("readme.gettingStarted.step5.title")}
                </h3>
                <p className="mt-1 text-stone-600 leading-relaxed">
                  {t("readme.gettingStarted.step5.desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="font-heading text-2xl font-bold text-purple-900">
              {t("readme.safety.title")}
            </h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
              <span className="text-stone-600">{t("readme.safety.tip1")}</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
              <span className="text-stone-600">{t("readme.safety.tip2")}</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
              <span className="text-stone-600">{t("readme.safety.tip3")}</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
              <span className="text-stone-600">{t("readme.safety.tip4")}</span>
            </li>
            <li className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-purple-500" />
              <span className="text-stone-600">{t("readme.safety.tip5")}</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-purple-600" />
            <h2 className="font-heading text-2xl font-bold text-purple-900">
              {t("readme.faq.title")}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-5">
              <h3 className="font-heading text-lg font-semibold text-purple-900">
                {t("readme.faq.q1.q")}
              </h3>
              <p className="mt-2 text-stone-600 leading-relaxed">
                {t("readme.faq.q1.a")}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-5">
              <h3 className="font-heading text-lg font-semibold text-purple-900">
                {t("readme.faq.q2.q")}
              </h3>
              <p className="mt-2 text-stone-600 leading-relaxed">
                {t("readme.faq.q2.a")}
              </p>
            </div>
          </div>
        </section>

        {/* Community Rules */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="h-6 w-6 text-purple-600" />
            <h2 className="font-heading text-2xl font-bold text-purple-900">
              {t("readme.rules.title")}
            </h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs mt-0.5">
                1
              </div>
              <span className="text-stone-600">{t("readme.rules.rule1")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs mt-0.5">
                2
              </div>
              <span className="text-stone-600">{t("readme.rules.rule2")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs mt-0.5">
                3
              </div>
              <span className="text-stone-600">{t("readme.rules.rule3")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs mt-0.5">
                4
              </div>
              <span className="text-stone-600">{t("readme.rules.rule4")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs mt-0.5">
                5
              </div>
              <span className="text-stone-600">{t("readme.rules.rule5")}</span>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

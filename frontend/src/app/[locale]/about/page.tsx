"use client";

import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Star, Users, Leaf, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-purple-900 sm:text-4xl">
            {t("about.title")}
          </h1>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t("about.subtitle")}
          </p>
        </section>

        {/* Our Story */}
        <section className="mb-12 rounded-2xl bg-white border border-purple-200 shadow-md p-8 sm:p-10">
          <h2 className="font-heading text-2xl font-bold text-purple-900">
            {t("about.story.title")}
          </h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            {t("about.story.p1")}
          </p>
          <p className="mt-4 text-stone-600 leading-relaxed">
            {t("about.story.p2")}
          </p>
        </section>

        {/* Mission */}
        <section className="mb-12 rounded-2xl bg-purple-600 shadow-md p-8 sm:p-10">
          <h2 className="font-heading text-2xl font-bold text-white">
            {t("about.mission.title")}
          </h2>
          <p className="mt-4 text-purple-100 leading-relaxed text-lg">
            {t("about.mission.p1")}
          </p>
        </section>

        {/* Values Grid */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-purple-900 text-center mb-8">
            {t("about.values.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Trust */}
            <div className="group rounded-2xl bg-white border border-purple-200 shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition-transform duration-300 group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-purple-900">
                {t("about.values.trust.title")}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {t("about.values.trust.desc")}
              </p>
            </div>

            {/* Sharing */}
            <div className="group rounded-2xl bg-white border border-purple-200 shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-transform duration-300 group-hover:scale-110">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-purple-900">
                {t("about.values.sharing.title")}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {t("about.values.sharing.desc")}
              </p>
            </div>

            {/* Community */}
            <div className="group rounded-2xl bg-white border border-purple-200 shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-purple-900">
                {t("about.values.community.title")}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {t("about.values.community.desc")}
              </p>
            </div>

            {/* Sustainability */}
            <div className="group rounded-2xl bg-white border border-purple-200 shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-transform duration-300 group-hover:scale-110">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-purple-900">
                {t("about.values.sustainability.title")}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {t("about.values.sustainability.desc")}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-purple-50 border border-purple-200 shadow-md p-8 sm:p-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-purple-900 sm:text-3xl">
            {t("about.cta.title")}
          </h2>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px shadow-md hover:shadow-lg"
          >
            {t("about.cta.button")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function HomePage() {
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
          <div className="absolute inset-0 bg-purple-50/70" />

          <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
            {/* Small badge/label above heading */}
            <p className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-4 py-1.5 text-xs font-medium text-purple-700 mb-6">
              <Share2 className="h-3.5 w-3.5" />
              Community Tool Library
            </p>

            <h1 className="font-display text-4xl font-bold tracking-tight text-purple-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Share tools,{" "}
              <span className="text-green-600">build community</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed">
              Borrow and lend rarely used tools and equipment within your neighborhood.
              Save money, reduce waste, and help your community thrive.
            </p>

            {/* Search CTA + Join */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/items"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px shadow-md hover:shadow-lg"
              >
                <Search className="h-5 w-5" />
                Browse Tools
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-purple-600 bg-white px-6 py-3 text-base font-medium text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:-translate-y-px"
              >
                Join Now
              </Link>
            </div>

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

        {/* How it works */}
        <section className="border-t border-purple-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold text-purple-900 sm:text-4xl">How It Works</h2>
              <p className="mt-3 text-stone-600">Three simple steps to start sharing</p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                { icon: Search, title: "Browse & Find", color: "bg-purple-100 text-purple-700", desc: "Search for tools and equipment near you, from drills to camping gear." },
                { icon: Send, title: "Request to Borrow", color: "bg-green-100 text-green-700", desc: "Send a borrow request to the owner. They'll approve it in a tap." },
                { icon: RotateCcw, title: "Use & Return", color: "bg-purple-100 text-purple-700", desc: "Pick up, use it, return it. Rate each other to build community trust." },
              ].map(({ icon: Icon, title, color, desc }) => (
                <div key={title} className="group rounded-2xl bg-purple-50/50 border border-purple-100 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-semibold text-purple-900">{title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats section with animated counters */}
        <section className="bg-purple-600 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              {[
                { icon: Package, value: 1250, label: "Items Shared", suffix: "+" },
                { icon: Users, value: 840, label: "Community Members", suffix: "+" },
                { icon: ArrowRightLeft, value: 3200, label: "Successful Borrows", suffix: "+" },
              ].map(({ icon: Icon, value, label, suffix }) => (
                <div key={label} className="text-white">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-purple-300" />
                  <p className="font-display text-4xl font-bold sm:text-5xl">
                    <AnimatedCounter end={value} suffix={suffix} />
                  </p>
                  <p className="mt-1 text-purple-200 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built on Trust section */}
        <section className="border-t border-purple-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-purple-900 sm:text-4xl">Built on Trust</h2>
            <p className="mt-3 text-stone-600">Every borrow builds reputation. Our community thrives on mutual trust.</p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Shield, title: "Verified Users", desc: "Community members build trust scores through reviews and successful borrows." },
                { icon: Star, title: "5-Star Reviews", desc: "Rate your experience after every borrow. Transparency builds accountability." },
                { icon: Users, title: "Local Community", desc: "Neighbors helping neighbors. Tools shared within your trusted community." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-purple-100 bg-purple-50/50 p-6">
                  <Icon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-semibold text-purple-900">{title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{desc}</p>
                </div>
              ))}
            </div>

            {/* Testimonial placeholder */}
            <div className="mt-12 rounded-2xl bg-purple-50 border border-purple-200 p-8 text-center">
              <MessageSquare className="h-8 w-8 text-purple-300 mx-auto mb-3" />
              <p className="text-stone-600 italic max-w-xl mx-auto">
                &ldquo;Community testimonials coming soon. Share your experience after your first borrow!&rdquo;
              </p>
              <p className="mt-4 text-xs text-stone-400">&mdash; ShareShelf Community</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-purple-50 py-16 text-center border-t border-purple-200">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-heading text-3xl font-bold text-purple-900">Ready to start sharing?</h2>
            <p className="mt-3 text-stone-600">Join your neighborhood tool library today.</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-green-700 transition-all duration-200 hover:-translate-y-px shadow-md hover:shadow-lg"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

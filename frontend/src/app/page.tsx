import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Share tools,{" "}
            <span className="text-emerald-600">build community</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            Borrow and lend rarely used tools and equipment within your neighborhood.
            Save money, reduce waste, and help your community thrive.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/items"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Browse Items
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-stone-200 bg-stone-100 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-stone-900">How It Works</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Browse & Find", desc: "Search for tools and equipment near you, from drills to camping gear." },
                { step: "2", title: "Request to Borrow", desc: "Send a borrow request to the owner. They&apos;ll approve it in a tap." },
                { step: "3", title: "Use & Return", desc: "Pick up, use it, return it. Rate each other to build community trust." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Callout */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600">Community Tool Library</p>
          <p className="mt-2 text-xl text-stone-600">
            Why buy something you&apos;ll only use once? Share what you have, borrow what you need.
          </p>
        </section>
      </main>
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        <p className="font-medium text-stone-700">ShareShelf</p>
        <p>&copy; {new Date().getFullYear()} ShareShelf. All rights reserved.</p>
      </footer>
    </>
  );
}

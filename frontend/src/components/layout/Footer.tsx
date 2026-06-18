import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-purple-200 bg-purple-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1 — About */}
          <div>
            <h3 className="font-display text-lg font-semibold text-purple-800">
              ShareShelf
            </h3>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Community-powered tool sharing. Save money, reduce waste, build community.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-purple-800">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/items"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/items/new"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  Add Item
                </Link>
              </li>
              <li>
                <Link
                  href="/borrow"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  My Borrows
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Community */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-purple-800">
              Community
            </h3>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Join your neighborhood tool-sharing network. Borrow what you need, lend what you have.
            </p>
            <p className="mt-2 text-sm text-stone-400">
              Built with love for communities everywhere.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-purple-200 pt-4 text-center text-sm text-stone-400">
          &copy; {year} ShareShelf. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

"use client";

import { Link } from "@/i18n/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const year = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  return (
    <footer className="border-t border-purple-200 bg-purple-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1 — About */}
          <div>
            <h3 className="font-display text-lg font-semibold text-purple-800">
              {t("footer.about")}
            </h3>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              {t("footer.aboutDesc")}
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-purple-800">
              {t("footer.quickLinks")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/items"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  {t("footer.browseTools")}
                </Link>
              </li>
              <li>
                <Link
                  href="/items/new"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  {t("footer.addItem")}
                </Link>
              </li>
              <li>
                <Link
                  href="/borrow"
                  className="text-sm text-stone-600 hover:text-purple-700 transition-colors duration-200"
                >
                  {t("footer.myBorrows")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Community */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-purple-800">
              {t("footer.community")}
            </h3>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              {t("footer.communityDesc")}
            </p>
            <p className="mt-2 text-sm text-stone-400">
              {t("footer.builtWith")}
            </p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-1 border border-purple-200 rounded-lg p-0.5">
            <button
              onClick={() => router.replace(pathname, { locale: 'en' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'en' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => router.replace(pathname, { locale: 'my' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${locale === 'my' ? 'bg-purple-600 text-white' : 'text-stone-500 hover:text-purple-700'}`}
            >
              မြန်မာ
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 border-t border-purple-200 pt-4 text-center text-sm text-stone-400">
          &copy; {year} ShareShelf. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

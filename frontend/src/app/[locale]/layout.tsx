import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";

export const metadata: Metadata = {
  title: "ShareShelf — Community Tool Library",
  description:
    "Borrow and lend tools and equipment within your community. Save money, reduce waste, and build connections.",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'my')) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className="min-h-screen bg-purple-50 text-stone-900 antialiased font-[family-name:var(--font-body)]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

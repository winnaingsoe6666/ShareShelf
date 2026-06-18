import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShareShelf — Community Tool Library",
  description:
    "Borrow and lend tools and equipment within your community. Save money, reduce waste, and build connections.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-purple-50 text-stone-900 antialiased font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}

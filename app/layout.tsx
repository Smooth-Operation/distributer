import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ad Brain — Ad Distribution Manager",
  description: "Sync every platform. Let AI tell you what to scale, fix, or kill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-ink-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

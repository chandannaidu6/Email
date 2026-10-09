import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Gift Card Drawing · CSU Code Review Study",
  description: "Optional entry for a $100 gift card drawing for participants of the CSU code review study.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#123a20",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}

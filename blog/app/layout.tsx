import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumify Blog",
    template: "%s | Lumify Blog",
  },
  description: "Educação financeira, orçamento e investimentos — Lumify Blog.",
  icons: {
    icon: [{ url: "/lumify-favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-lumify-muted/80 bg-lumify-mesh font-sans text-lumify-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

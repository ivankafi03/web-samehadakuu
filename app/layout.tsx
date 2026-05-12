import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ChatWidget from "@/components/ChatWidget";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdScripts from "@/components/ads/AdScripts";
import AdblockDetector from "@/components/ads/AdblockDetector";
import AdUnit from "@/components/ads/AdUnit";

import Footer from "@/components/Footer";
import NotificationToast from "@/components/NotificationToast";
import RewardNotification from "@/components/RewardNotification";

// Inter — font utama untuk UI, body, label, form
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Nunito — font display untuk heading/judul, lebih soft & modern
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cuanflix.site"),
  title: {
    default: "Cuanflix - Premium Database | HD Streaming",
    template: "%s | Cuanflix"
  },
  description: "Eksplorasi database video terlengkap dengan Cuanflix. Streaming HD, Cepat, & Estetik.",
  keywords: ["streaming video", "cuanflix", "hd video", "nonton hd"],
  authors: [{ name: "Cuanflix Team" }],

  other: {
    monetag: "355a8ebbeed7ba984eb785bbb6977945",
  },
  openGraph: {
    title: "Cuanflix - Premium Streaming Database",
    description: "Database streaming tercepat dan terlengkap dengan antarmuka yang bersih.",
    url: "https://cuanflix.site",
    siteName: "Cuanflix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cuanflix - Streaming",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuanflix - Premium Streaming Database",
    description: "Streaming tercepat dengan antarmuka premium.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // IP Ban check — runs on every page load (server-side)
  try {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "";
    
    // Bypass IP check for social media bots to ensure OG images work
    const isSocialBot = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot/i.test(userAgent);
    
    if (!isSocialBot) {
      const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim()
        || headerList.get("x-real-ip")
        || null;

      if (ip) {
        const banned = await prisma.blockedIp.findUnique({ where: { ip } });
        if (banned) {
          redirect("/blocked");
        }
      }
    }
  } catch {
    // Non-critical: if check fails, don't block legitimate users
  }

  // Cek apakah user adalah admin — jika iya, sembunyikan semua iklan
  // Cek apakah user adalah admin — jika iya, sembunyikan semua iklan
  const session = await getServerSession(authOptions) as any;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.variable} ${nunito.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative`} suppressHydrationWarning>
        <div className="fixed inset-0 bg-dot-grid opacity-20 pointer-events-none z-[-1]" />
        <Providers>
          <Navbar />
          <main className="flex-grow min-h-screen">
            {children}
          </main>
          <Footer />
          <ChatWidget />
          {!isAdmin && <AdScripts />}
          <AdblockDetector />
          <NotificationToast />
          <RewardNotification />
        </Providers>
      </body>
    </html>
  );
}

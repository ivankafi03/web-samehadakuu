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
  metadataBase: new URL("https://samehadakuu.com"),
  title: {
    default: "Samehadakuu - Watch Anime & Earn Money | Sub Indo HD",
    template: "%s | Samehadakuu"
  },
  description: "Nonton anime favoritmu dan dapatkan uang! Platform streaming anime pertama yang membayar Anda untuk menonton dan membagikan link. HD, Cepat, & Terlengkap.",
  keywords: ["nonton anime dapat uang", "anime subtitle indonesia", "streaming anime", "affiliate anime", "watch to earn anime"],
  authors: [{ name: "Samehadakuu Team" }],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
  },
  other: {
    monetag: "355a8ebbeed7ba984eb785bbb6977945",
  },
  openGraph: {
    title: "Samehadakuu - Watch Anime & Earn Money",
    description: "Nonton anime dan dapatkan uang tunai! Bagikan link affiliate-mu dan raih pendapatan harian. Streaming HD Sub Indo Terlengkap.",
    url: "https://samehadakuu.com",
    siteName: "Samehadakuu",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Samehadakuu - Watch & Earn Anime",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samehadakuu - Watch Anime & Earn Money",
    description: "Platform anime pertama yang membayar penontonnya. Nonton HD & Share Link = Cuan!",
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
  const session = await getServerSession(authOptions);
  const isMemberOrAdmin = !!session?.user;

  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.variable} ${nunito.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative`} suppressHydrationWarning>
        <div className="fixed inset-0 bg-dot-grid opacity-20 pointer-events-none z-[-1]" />
        <Providers>
          <Navbar />
          <div className="max-w-[1600px] mx-auto px-4 pt-4 flex justify-center">
            <AdUnit type="mobile" className="!justify-center" />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <div className="max-w-[1600px] mx-auto px-4 py-6 flex justify-center border-t border-white/5">
            <AdUnit type="rectangle" className="!justify-center" />
          </div>
          <ChatWidget />
          <AdScripts />
          <AdblockDetector />
        </Providers>
      </body>
    </html>
  );
}

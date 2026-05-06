import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ChatWidget from "@/components/ChatWidget";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  title: "Samehadakuu - Nonton Anime Subtitle Indonesia Terlengkap",
  description: "Dapatkan akses gratis ke ribuan episode anime terbaru dengan subtitle Indonesia. Streaming cepat, kualitas HD, dan koleksi lengkap hanya di Samehadakuu.",
  keywords: ["nonton anime", "anime subtitle indonesia", "streaming anime", "anime terbaru", "solo leveling sub indo"],
  authors: [{ name: "Samehadakuu Team" }],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/icon.png",
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
    const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim()
      || headerList.get("x-real-ip")
      || null;

    if (ip) {
      const banned = await prisma.blockedIp.findUnique({ where: { ip } });
      if (banned) {
        redirect("/blocked");
      }
    }
  } catch {
    // Non-critical: if check fails, don't block legitimate users
  }

  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.variable} ${nunito.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative`} suppressHydrationWarning>
        <div className="fixed inset-0 bg-dot-grid opacity-20 pointer-events-none z-[-1]" />
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}

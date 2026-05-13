import { Suspense } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import AnimeSection from "@/components/AnimeSection";
import { getLatestAnime, getPopularAnime, getFeaturedAnime, getOngoingAnime, getMovieAnime, mapAnimeList } from "@/lib/anime";
import prisma from "@/lib/prisma";
import AdUnit from "@/components/ads/AdUnit";
import AdNative from "@/components/ads/AdNative";

export default async function Home() {
  const settings = await prisma.systemSettings.findFirst();
  const telegramLink = settings?.telegramLink || "https://t.me/samehadakuu_official";

  return (
    <div className="flex flex-col pb-20">
      <h1 className="sr-only">Samehadakuu - Watch Anime Online Free with HD Quality</h1>

      <Suspense fallback={<div className="h-[62vh] md:h-[80vh] bg-zinc-900 animate-pulse" />}>
        <HeroSection />
      </Suspense>

      <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-16 mt-12">
        <Suspense fallback={<div className="h-72 bg-zinc-900/50 animate-pulse rounded-xl" />}>
          <LatestAnimeContent title="Latest Releases" />
        </Suspense>

        <div className="w-full flex justify-center py-4">
          <div className="hidden md:block">
            <AdUnit type="leaderboard" />
          </div>
          <div className="block md:hidden">
            <AdUnit type="mobile" />
          </div>
        </div>

        <Suspense fallback={<div className="h-72 bg-zinc-900/50 animate-pulse rounded-xl" />}>
          <OngoingAnimeContent />
        </Suspense>

        {/* CTA — lebih natural, kurang salesy */}
        <section className="border border-white/8 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-zinc-900/30">
          <div className="flex flex-col gap-3 max-w-lg">
            <span className="text-primary text-sm font-medium">Earning Program</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              Watch Anime, Get Paid
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Every minute you spend watching on Samehadakuu counts as points that you can withdraw. Join over 12,000 active members.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              href="/auth/register"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap text-center"
            >
              Register Free
            </Link>
            <Link
              href="/auth/login"
              className="text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Already have an account? Login
            </Link>
          </div>
        </section>

        <Suspense fallback={<div className="h-72 bg-zinc-900/50 animate-pulse rounded-xl" />}>
          <MovieAnimeContent />
        </Suspense>

        <div className="w-full flex justify-center py-4">
          <div className="hidden md:block">
            <AdUnit type="leaderboard" />
          </div>
          <div className="block md:hidden">
            <AdUnit type="mobile" />
          </div>
        </div>

        <Suspense fallback={<div className="h-72 bg-zinc-900/50 animate-pulse rounded-xl" />}>
          <TrendingAnimeContent />
        </Suspense>

        {/* AdsTerra Native Banner — menyatu dengan konten */}
        <AdNative className="my-2" />
      </main>

      {/* AdsTerra Leaderboard Banner — desktop 728x90, mobile 320x50 */}
      <div className="w-full flex justify-center py-4 bg-zinc-950/50">
        <div className="hidden md:block">
          <AdUnit type="leaderboard" />
        </div>
        <div className="block md:hidden">
          <AdUnit type="mobile" />
        </div>
      </div>

      <footer className="border-t border-white/5 mt-20 pt-10 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">
              Same<span className="text-primary">hadakuu</span>
            </span>
            <span className="text-zinc-700">·</span>
            <span>© 2024. Built for the global anime community.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.27 4.84-2.11 5.8-2.52 2.76-1.17 3.33-1.37 3.7-.137.08.02.26.07.38.17.1.08.13.19.14.3.01.1-.01.2-.02.3z" />
              </svg>
              Telegram
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function HeroSection() {
  const data = await getFeaturedAnime();
  return <Hero data={data} />;
}

async function LatestAnimeContent({ title = "Rilis Terbaru" }: { title?: string }) {
  const data = await getLatestAnime();
  const latestData = mapAnimeList(data);
  return <AnimeSection title={title} data={latestData} href="/anime/ongoing" />;
}

async function OngoingAnimeContent() {
  const data = await getOngoingAnime();
  const latestData = mapAnimeList(data);
  return <AnimeSection title="Ongoing Anime" data={latestData} href="/anime/ongoing" />;
}

async function MovieAnimeContent() {
  const data = await getMovieAnime();
  const latestData = mapAnimeList(data);
  return <AnimeSection title="Anime Movies" data={latestData} href="/anime/movies" />;
}

async function TrendingAnimeContent() {
  const data = await getPopularAnime();
  const trendingData = mapAnimeList(data);
  return <AnimeSection title="Trending This Week" data={trendingData} href="/anime/popular" />;
}

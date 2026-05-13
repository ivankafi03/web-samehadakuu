import { Suspense } from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import HeroSlider from "@/components/HeroSlider";
import AdNative from "@/components/ads/AdNative";
import { getLatestAnime, getFeaturedAnime, getOngoingAnime, getMovieAnime, mapAnimeList } from "@/lib/cuanflix";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Samehadakuu - Nonton Anime Sub Indo Gratis",
  description: "Portal nonton anime subtitle Indonesia terlengkap dan terupdate. Nikmati pengalaman streaming anime kualitas HD tanpa buffering hanya di Samehadakuu.",
};

export default async function Home() {
  const [featured, latest, ongoing, movies] = await Promise.all([
    getFeaturedAnime(),
    getLatestAnime(),
    getOngoingAnime(),
    getMovieAnime()
  ]);
  
  const sliderVideos = mapAnimeList(featured.slice(0, 5));
  const latestData = mapAnimeList(latest);
  const ongoingData = mapAnimeList(ongoing);
  const movieData = mapAnimeList(movies);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <h1 className="sr-only">Samehadakuu — Nonton Anime Sub Indo</h1>

      {sliderVideos.length > 0 && <HeroSlider videos={sliderVideos} />}
      
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 w-full flex flex-col gap-16 pb-24 -mt-10 relative z-20">
        <div className="flex flex-col gap-14">
          
          {/* Latest Anime Section */}
          <AnimeSection
            title="Latest Updates"
            data={latestData}
            href="/categories"
          />

          <div className="flex justify-center -my-4">
            <AdNative />
          </div>

          {/* Ongoing Anime Section */}
          <AnimeSection
            title="Ongoing Series"
            data={ongoingData}
            href="/categories"
          />

          {/* Movies Section */}
          <AnimeSection
            title="Anime Movies"
            data={movieData}
            href="/categories"
          />

        </div>
      </main>

      {/* Footer Branding Fix included in components/Footer.tsx */}
    </div>
  );
}

import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { getPopularAnime, mapAnimeList } from "@/lib/anime";
import AdUnit from "@/components/ads/AdUnit";

export const metadata = {
    title: "Video Paling Populer - Samehadakuu",
    description: "Daftar video paling populer dan banyak ditonton oleh komunitas Samehadakuu."
};

export default async function PopularPage() {
    const data = await getPopularAnime();
    const mappedData = mapAnimeList(data);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24 min-h-screen">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Popular <span className="text-primary">Trends</span></h1>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em]">Paling Banyak Ditonton Minggu Ini</p>
                </div>
                
                <AnimeSection
                    title=""
                    data={mappedData}
                />

                <div className="w-full flex flex-col items-center gap-6 py-8">
                  <div className="hidden md:block">
                    <AdUnit type="leaderboard" />
                  </div>
                  <div className="block md:hidden">
                    <AdUnit type="mobile" />
                  </div>
                  <AdUnit type="rectangle" />
                </div>
            </main>
        </div>
    );
}

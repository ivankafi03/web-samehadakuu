import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { getAnimeList, mapAnimeList } from "@/lib/anime";
import AdUnit from "@/components/ads/AdUnit";

export default async function AnimeListPage() {
    const animeData = await getAnimeList('anime/');
    const mappedData = mapAnimeList(animeData);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
                <AnimeSection
                    title="All Anime List"
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

import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { getAnimeList, mapAnimeList } from "@/lib/anime";

export default async function AnimeListPage() {
    const animeData = await getAnimeList('anime/');
    const mappedData = mapAnimeList(animeData);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
                <AnimeSection
                    title="Daftar Anime Lengkap"
                    data={mappedData}
                />
            </main>
        </div>
    );
}

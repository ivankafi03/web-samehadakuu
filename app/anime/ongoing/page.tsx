import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { getOngoingAnime, mapAnimeList } from "@/lib/anime";

export const metadata = {
    title: "Anime Ongoing Terbaru - Samehadakuu",
    description: "Nonton anime yang sedang tayang (ongoing) subtitle Indonesia terbaru dan tercepat."
};

export default async function OngoingPage() {
    const data = await getOngoingAnime();
    const mappedData = mapAnimeList(data);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24 min-h-screen">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Ongoing <span className="text-primary">Series</span></h1>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em]">Update Tercepat Setiap Hari</p>
                </div>
                
                <AnimeSection
                    title=""
                    data={mappedData}
                />
            </main>
        </div>
    );
}

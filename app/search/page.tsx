import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { searchAnime, mapAnimeList } from "@/lib/anime";
import { redirect } from "next/navigation";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q: query } = await searchParams;

    if (!query) {
        redirect("/");
    }

    const searchResults = await searchAnime(query);
    const mappedData = mapAnimeList(searchResults);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">Search Results</h1>
                    <p className="text-zinc-400">
                        Showing results for: <span className="text-primary font-bold">"{query}"</span>
                    </p>
                </div>

                {mappedData.length > 0 ? (
                    <AnimeSection
                        title={`Found (${mappedData.length})`}
                        data={mappedData}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-zinc-600">🔍</span>
                        </div>
                        <div>
                            <p className="text-white text-xl font-bold">Sorry, no anime found.</p>
                            <p className="text-zinc-500">Try using different keywords.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

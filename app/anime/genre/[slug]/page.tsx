import React from "react";
import AnimeSection from "@/components/AnimeSection";
import { getAnimeList, mapAnimeList } from "@/lib/cuanflix";

interface GenrePageProps {
    params: {
        slug: string;
    }
}

export async function generateMetadata({ params }: GenrePageProps) {
    const genreName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
        title: `Watch ${genreName} Videos Online - Cuanflix`,
        description: `Complete collection of ${genreName} anime with HD quality.`
    };
}

export default async function GenrePage({ params }: GenrePageProps) {
    const { slug } = params;
    const genreName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    // Fetch from genre path
    const data = await getAnimeList(`genres/${slug}/`);
    const mappedData = mapAnimeList(data);

    return (
        <div className="flex flex-col gap-12 pb-20 pt-24 min-h-screen">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Genre: <span className="text-primary">{genreName}</span></h1>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em]">Explore {genreName} Collection</p>
                </div>
                
                {mappedData.length > 0 ? (
                    <AnimeSection
                        title=""
                        data={mappedData}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[2.5rem] border border-white/5">
                        <p className="text-zinc-500 font-black uppercase tracking-[0.3em]">Data Not Found</p>
                    </div>
                )}
            </main>
        </div>
    );
}

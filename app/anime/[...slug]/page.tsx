import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Play, Star, Clock, Calendar, List } from "lucide-react";
import { redirect } from "next/navigation";
import { getAnimeDetail, getUrlFromSlug, getSlugFromUrl } from "@/lib/anime";
import WatchlistButton from "@/components/WatchlistButton";
import AnimeShareButton from "@/components/AnimeShareButton";

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    const path = slug.join('/');
    const fullPath = path.startsWith('anime/') ? path : `anime/${path}`;
    const url = getUrlFromSlug(fullPath);
    const anime = await getAnimeDetail(url);

    if (!anime) return { title: "Anime Detail - Samehadakuu" };

    return {
        title: `Nonton ${anime.title} Subtitle Indonesia - Samehadakuu`,
        description: `Streaming anime ${anime.title} subtitle Indonesia secara gratis. Sinopsis: ${anime.synopsis?.slice(0, 160)}...`,
        openGraph: {
            images: [anime.image],
        },
    };
}

export default async function AnimeDetailPrettyPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string[] }>,
    searchParams: Promise<{ url?: string }>
}) {
    const { slug } = await params;
    const { url: legacyUrl } = await searchParams;
    const path = slug.join('/');

    // Handle legacy URLs: /anime/detail?url=... or /anime/id?url=...
    if ((path === 'detail' || path === 'id') && legacyUrl) {
        const slugFromUrl = getSlugFromUrl(legacyUrl);
        if (slugFromUrl) {
            // Remove 'anime/' prefix if present in slug from URL to avoid duplication
            const cleanSlug = slugFromUrl.replace(/^anime\//, '');
            redirect(`/anime/${cleanSlug}`);
        }
    }

    // Reconstruct the full source URL. 
    // If the path doesn't start with 'anime/', we prepend it because this is the detail page.
    const fullPath = path.startsWith('anime/') ? path : `anime/${path}`;
    const url = getUrlFromSlug(fullPath);

    const anime = await getAnimeDetail(url);

    if (!anime) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-white text-xl font-bold">Data anime tidak dapat dimuat.</p>
                    <Link href="/" className="text-primary hover:underline">Kembali ke Home</Link>
                </div>
            </div>
        );
    }

    // Use the first episode link for the "Nonton Sekarang" button if available
    const watchUrl = anime.episodes.length > 0
        ? `/watch/${getSlugFromUrl(anime.episodes[0].link)}`
        : "#";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Banner Section */}
            <div className="relative w-full h-[50vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-30"
                    style={{ backgroundImage: `url(${anime.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-64 relative z-10">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Poster */}
                    <div className="w-full md:w-72 flex-shrink-0">
                        <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <Image src={anime.image} alt={anime.title} fill className="object-cover" />
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <Link
                                href={watchUrl}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Nonton Sekarang
                            </Link>
                            <div className="flex gap-3">
                                <WatchlistButton
                                    anime={{
                                        id: path,
                                        title: anime.title,
                                        image: anime.image,
                                        type: anime.status,
                                        href: url
                                    }}
                                    variant="icon"
                                />
                                <AnimeShareButton animeTitle={anime.title} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col gap-6 pt-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{anime.title}</h1>
                            <p className="text-lg text-muted-foreground font-medium">{anime.originalTitle}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold">{anime.rating || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20">
                                <Calendar className="w-5 h-5" />
                                <span className="font-bold">{anime.released}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                                <Clock className="w-5 h-5" />
                                <span className="font-bold">{anime.status}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {anime.genres.map(g => (
                                <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-2">
                            <h3 className="text-lg font-bold text-white mb-3">Sinopsis</h3>
                            <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                                {anime.synopsis}
                            </p>
                        </div>

                        {/* Episode List */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-2 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <List className="w-5 h-5 text-primary" />
                                    Daftar Episode
                                </h3>
                                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{anime.episodes.length} EPISODE</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {anime.episodes.map((ep, i) => (
                                    <Link
                                        key={i}
                                        href={`/watch/${getSlugFromUrl(ep.link)}`}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                {ep.eps || (anime.episodes.length - i)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-sm line-clamp-1">{ep.title}</span>
                                                <span className="text-zinc-500 text-xs">{ep.date}</span>
                                            </div>
                                        </div>
                                        <Play className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Studio</p>
                                <p className="text-white font-medium">{anime.studio}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Kualitas</p>
                                <p className="text-white font-medium">HD Official</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

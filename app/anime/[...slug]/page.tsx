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

    if (!anime) return { title: "Video Detail - Samehadakuu" };

    return {
        title: `Watch ${anime.title} Online - Samehadakuu`,
        description: `Stream ${anime.title} with HD quality for free. Synopsis: ${anime.synopsis?.slice(0, 160)}...`,
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

    if ((path === 'detail' || path === 'id') && legacyUrl) {
        const slugFromUrl = getSlugFromUrl(legacyUrl);
        if (slugFromUrl) {
            const cleanSlug = slugFromUrl.replace(/^anime\//, '');
            redirect(`/anime/${cleanSlug}`);
        }
    }

    // Fail-safe: If path looks like a JAV ID, redirect to watch page
    if (path.startsWith('jav/') || /^\d+$/.test(path)) {
        const id = path.replace(/^jav\//, '');
        redirect(`/watch/jav/${id}`);
    }

    const fullPath = path.startsWith('anime/') ? path : `anime/${path}`;
    const url = getUrlFromSlug(fullPath);
    const anime = await getAnimeDetail(url);

    if (!anime) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-white text-xl font-bold">Anime data could not be loaded.</p>
                    <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    const watchUrl = anime.episodes.length > 0
        ? `/go?to=/watch/${getSlugFromUrl(anime.episodes[0].link)}`
        : "#";

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Banner */}
            <div className="relative w-full h-[35vh] md:h-[50vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-30"
                    style={{ backgroundImage: `url(${anime.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-32 md:-mt-64 relative z-10">

                {/* Poster + Info Row */}
                <div className="flex flex-row gap-4 md:gap-10 items-start">

                    {/* Poster */}
                    <div className="w-24 sm:w-32 md:w-72 flex-shrink-0">
                        <div className="aspect-[2/3] relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <Image src={anime.image} alt={anime.title} fill className="object-cover" />
                        </div>

                        {/* Tombol nonton — desktop only */}
                        <div className="hidden md:flex flex-col gap-3 mt-4">
                            <Link
                                href={watchUrl}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Watch Now
                            </Link>
                            <div className="flex gap-3">
                                <WatchlistButton
                                    anime={{ id: path, title: anime.title, image: anime.image, type: anime.status, href: url }}
                                    variant="icon"
                                />
                                <AnimeShareButton animeTitle={anime.title} />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-3 md:gap-5 pt-2 md:pt-10 flex-1 min-w-0">
                        <div>
                            <h1 className="text-lg sm:text-2xl md:text-5xl font-black text-white leading-tight line-clamp-3">{anime.title}</h1>
                            {anime.originalTitle && (
                                <p className="text-xs md:text-lg text-muted-foreground font-medium mt-1 line-clamp-1">{anime.originalTitle}</p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 md:gap-3">
                            <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20 text-xs md:text-sm">
                                <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                                <span className="font-bold">{anime.rating || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-400/20 text-xs md:text-sm">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-bold">{anime.released}</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20 text-xs md:text-sm">
                                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-bold">{anime.status}</span>
                            </div>
                        </div>

                        {/* Genre */}
                        <div className="flex flex-wrap gap-1.5">
                            {anime.genres.map(g => (
                                <span key={g} className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Tombol nonton — mobile */}
                        <div className="flex md:hidden gap-2">
                            <Link
                                href={watchUrl}
                                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold flex items-center justify-center"
                                title="Watch Now"
                            >
                                <Play className="w-5 h-5 fill-current" />
                            </Link>
                            <WatchlistButton
                                anime={{ id: path, title: anime.title, image: anime.image, type: anime.status, href: url }}
                                variant="icon"
                            />
                            <AnimeShareButton animeTitle={anime.title} />
                        </div>
                    </div>
                </div>

                {/* Sinopsis */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 mt-5">
                    <h3 className="text-sm md:text-lg font-bold text-white mb-2">Synopsis</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm whitespace-pre-line">{anime.synopsis}</p>
                </div>


                {/* Detail */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Studio</p>
                        <p className="text-white font-medium text-sm">{anime.studio}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Quality</p>
                        <p className="text-white font-medium text-sm">HD Official</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

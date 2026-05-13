import React from "react";
import Link from "next/link";
import { MessageSquare, List, ThumbsUp, Heart, Share2, Info, Sparkles, Play, Layers } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWatchPageData, getUrlFromSlug, getSlugFromUrl, getAnimeDetail, searchAnime, getLatestAnime } from "@/lib/cuanflix";
import { getJavWatchData, getJavDetail, searchJav } from "@/lib/jav";
import VideoPlayer from "@/components/VideoPlayer";
import ReportButton from "@/components/ReportButton";
import WatchActions from "@/components/WatchActions";
import WatchEarningManager from "@/components/WatchEarningManager";
import HistoryLogger from "@/components/HistoryLogger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WatchPageClient from "@/components/WatchPageClient";
import AdUnit from "@/components/ads/AdUnit";
import AdNative from "@/components/ads/AdNative";

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    const path = slug.join('/');

    const url = getUrlFromSlug(path);
    let watchData: any = null;
    
    if (path.startsWith('jav/')) {
        const id = path.split('/').pop() || '';
        watchData = await getJavWatchData(id);
    } else {
        watchData = await getWatchPageData(url);
    }

    // Guess a readable title from the slug, or use watchData.title if available
    const title = watchData?.title || path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Watch Anime";

    return {
        title: `Nonton ${title} Sub Indo - Samehadakuu`,
        description: `Streaming ${title} Subtitle Indonesia kualitas HD gratis di Samehadakuu. Server kenceng dan pengalaman nonton anime terbaik.`,
    };
}

export default async function WatchPrettyPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string[] }>,
    searchParams: Promise<{ url?: string }>
}) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;
    const { url: legacyUrl } = await searchParams;
    const path = slug.join('/');

    // Handle legacy URLs: /watch/id?url=...
    if (path === 'id' && legacyUrl) {
        const slugFromUrl = getSlugFromUrl(legacyUrl);
        if (slugFromUrl) {
            redirect(`/watch/${slugFromUrl}`);
        }
    }

    // Fix for slugs like 'anime/blue-lock-episode-nagi' in watch route
    if (path.startsWith('anime/')) {
        const cleanSlug = path.replace(/^anime\//, '');
        const isEpisode = cleanSlug.includes('-episode-');

        if (isEpisode) {
            // It's an episode, redirect to the clean version
            redirect(`/watch/${cleanSlug}`);
        } else {
            // It's a series, redirect to the anime detail page
            redirect(`/anime/${cleanSlug}`);
        }
    }

    const url = getUrlFromSlug(path);
    let watchData: any = null;
    let seriesDetail: any = null;

    if (path.startsWith('jav/')) {
        const id = path.split('/').pop() || '';
        const [watchRes, detailRes] = await Promise.all([
            getJavWatchData(id),
            getJavDetail(id)
        ]);
        watchData = watchRes;
        seriesDetail = detailRes;
    } else {
        const [watchRes, detailRes] = await Promise.all([
            getWatchPageData(url),
            getAnimeDetail(url)
        ]);
        watchData = watchRes;
        seriesDetail = detailRes;
    }

    // Fetch related anime based on the first genre
    let relatedAnime: any[] = [];
    try {
        if (path.startsWith('jav/')) {
            const { videos: results } = await searchJav('School'); // Default category for related
            relatedAnime = results.slice(0, 6).map((item, idx) => ({
                id: idx + 1,
                title: item.title,
                image: item.image,
                rating: 0,
                episodes: 1,
                episodeRaw: item.episode,
                type: 'JAV',
                href: `/watch/${item.href}`
            }));
        } else if (seriesDetail && seriesDetail.genres && seriesDetail.genres.length > 0) {
            relatedAnime = await searchAnime(seriesDetail.genres[0]);
        }
        
        // Fallback: If no related by genre, get latest/popular anime
        if (relatedAnime.length < 3) {
            const latest = await getLatestAnime();
            relatedAnime = latest.slice(0, 6);
        }

        // Remove current anime from related
        relatedAnime = relatedAnime.filter(a => !(a.link || a.href || '').includes(path)).slice(0, 6);
    } catch (e) {
        console.error("Failed to fetch related anime", e);
    }

    if (!watchData || !watchData.servers || watchData.servers.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-12 rounded-3xl max-w-lg text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Info className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">Video Not Available</h2>
                        <p className="text-zinc-400">Sorry, we couldn't find any video servers for this episode. It might be under maintenance or removed.</p>
                    </div>
                    <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Earning Manager moved inside WatchPageClient */}

            {/* Log watch history */}
            <HistoryLogger
                videoId={path}
                videoTitle={watchData.title}
                videoImage={watchData.poster}
                videoUrl={`/watch/${path}`}
            />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-[80px] md:pt-[100px] flex flex-col gap-4">
                


                {/* Guest Call to Action Banner */}
                {!session && (
                    <div className="mb-6 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -translate-y-1/2 translate-x-1/4 rounded-full" />
                        <div className="flex flex-col gap-1.5 relative z-10 text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-primary font-black tracking-widest text-[10px] uppercase">Exclusive Access</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Samehadakuu VIP</h2>
                            <p className="text-zinc-500 font-medium text-sm max-w-xl">Login untuk simpan riwayat tontonan dan nikmati pengalaman nonton anime tanpa gangguan iklan pop-up.</p>
                        </div>
                        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                            <Link href="/auth/login" className="flex-1 md:flex-none px-6 py-3 bg-primary text-black rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 text-center uppercase tracking-wider">
                                Login
                            </Link>
                            <Link href="/auth/register" className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs hover:bg-white/10 transition-all text-center uppercase tracking-wider">
                                Register
                            </Link>
                        </div>
                    </div>
                )}

                <WatchPageClient
                    servers={watchData.servers}
                    downloads={watchData.downloads}
                    videoId={path}
                    relatedAnime={relatedAnime}
                >
                    {/* Native Banner Ad - Premium Content */}
                    <AdNative className="mt-8 mb-4" />

                    {/* Anime Info Section */}
                    <div className="bg-secondary border border-border rounded-xl p-5 md:p-6 shadow-md overflow-hidden relative mt-6">
                        <div className="flex flex-col gap-5 relative z-10">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
                                <div className="flex flex-col gap-1.5">
                                    <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">{watchData.title}</h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-primary font-semibold text-xs tracking-wide">Streaming Ultra HD • Global Node</p>
                                        {!session && (
                                            <Link href="/auth/login" className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md group hover:bg-primary/20 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Ad-Lite Available</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <WatchActions
                                    anime={{
                                        id: path,
                                        title: watchData.title,
                                        image: watchData.poster,
                                        rating: parseFloat(watchData.rating) > 0 ? parseFloat(watchData.rating) : 0,
                                        episodes: parseInt(watchData.episode) || 0,
                                        type: watchData.type,
                                        href: url
                                    }}
                                />
                            </div>

                            {/* Additional Info Section */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Rewards Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-foreground text-xs font-bold uppercase">Active Tracking</span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Member Support</span>
                                        <p className="text-white/60 text-[10px] font-medium italic max-w-xs leading-tight">
                                            Switch servers if loading is slow. Rewards are counted automatically.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Server: {watchData.servers[0]?.name || "Auto"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </WatchPageClient>
            </div>
        </div>
    );
}

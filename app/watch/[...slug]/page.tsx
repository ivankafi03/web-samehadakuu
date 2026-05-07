import React from "react";
import Link from "next/link";
import { MessageSquare, List, ThumbsUp, Heart, Share2, Info, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWatchPageData, getUrlFromSlug, getSlugFromUrl } from "@/lib/anime";
import VideoPlayer from "@/components/VideoPlayer";
import ReportButton from "@/components/ReportButton";
import WatchActions from "@/components/WatchActions";
import WatchEarningManager from "@/components/WatchEarningManager";
import HistoryLogger from "@/components/HistoryLogger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WatchPageClient from "@/components/WatchPageClient";
import AdUnit from "@/components/ads/AdUnit";

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    const path = slug.join('/');

    const url = getUrlFromSlug(path);
    const watchData = await getWatchPageData(url);

    // Guess a readable title from the slug, or use watchData.title if available
    const title = watchData?.title || path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Watch Anime";

    return {
        title: `Watch ${title} Online - Samehadakuu`,
        description: `Stream ${title} in HD quality for free on Samehadakuu. High speed servers and premium experience.`,
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
    const watchData = await getWatchPageData(url);

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

            <div className="max-w-[1600px] mx-auto px-4 md:px-6 pt-6 flex flex-col gap-6">
                
                {/* Top Leaderboard Banner */}
                <div className="w-full flex justify-center">
                    <AdUnit type="leaderboard" className="!justify-center" />
                </div>

                {/* Guest Call to Action Banner */}
                {!session && (
                    <div className="mb-6 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/4 rounded-full" />
                        <div className="flex flex-col gap-1.5 relative z-10 text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-primary font-black tracking-widest text-[10px] uppercase">Exclusive Access</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Get Rewards & Minimize Ads</h2>
                            <p className="text-zinc-500 font-medium text-sm max-w-xl">Login to earn rewards automatically and enjoy a cleaner, ad-lite experience with fewer pop-ups.</p>
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
                    videoId={path}
                    sidebar={
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col p-6">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                <List className="w-5 h-5 text-primary" />
                                Streaming Info
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                You are watching with the best HD quality available from our premium servers.
                            </p>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs py-2 border-b border-white/5">
                                    <span className="text-zinc-500">Quality</span>
                                    <span className="text-white font-bold">Multi (360p - 1080p)</span>
                                </div>
                                <div className="flex justify-between text-xs py-2 border-b border-white/5">
                                    <span className="text-zinc-500">Server</span>
                                    <span className="text-white font-bold">{watchData.servers.length} Available</span>
                                </div>
                            </div>
                            <ReportButton />
                        </div>
                    }
                >
                    {/* Anime Info & Actions */}
                    <div className="flex flex-col gap-4 bg-[#0F0F11] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="mb-2">
                                    <AdUnit type="leaderboard" className="!justify-start" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tighter">{watchData.title}</h1>
                                    <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Streaming Ultra HD • Global Node</p>
                                </div>
                            </div>
                            {!session && (
                                <Link href="/auth/login" className="hidden lg:flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl group hover:bg-primary/20 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tired of ads? Login for Ad-Lite</span>
                                </Link>
                            )}
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

                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Info className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                <span className="text-white font-black uppercase tracking-tighter">Member Tips:</span> Switch servers if the player takes too long to load. Rewards are still counted automatically.
                            </p>
                        </div>
                    </div>
                </WatchPageClient>
            </div>
        </div>
    );
}

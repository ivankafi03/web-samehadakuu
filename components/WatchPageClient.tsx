"use client";

import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import WatchEarningManager from "./WatchEarningManager";
import { VideoServer } from "@/lib/cuanflix";
import dynamic from "next/dynamic";
import AdUnit from "./ads/AdUnit";
import { List, X, ChevronRight, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import AnimeCard from "./AnimeCard";

const CommentSection = dynamic(() => import("./CommentSection"), {
    loading: () => <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse mt-6">Memuat Komentar...</div>,
    ssr: false
});

interface DownloadLink {
    name: string;
    link: string;
}

interface DownloadFormat {
    format: string;
    links: DownloadLink[];
}

interface WatchPageClientProps {
    servers: VideoServer[];
    downloads?: DownloadFormat[];
    videoId: string;
    children?: React.ReactNode;
    sidebar?: React.ReactNode;
    episodes?: any[];
    relatedAnime?: any[];
}

export default function WatchPageClient({ 
    servers, 
    downloads = [],
    videoId, 
    children, 
    sidebar, 
    episodes = [], 
    relatedAnime = [] 
}: WatchPageClientProps) {
    const [isWatching, setIsWatching] = useState(false);
    const [showEpisodes, setShowEpisodes] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">


            {/* Main Video Area */}
            <div className="flex-1 flex flex-col">
                {/* Watch earning — only active when user has clicked Play */}
                <div className="empty:hidden mb-4">
                    {/* The Earning Manager is now stacked higher in its own CSS */}
                    {isWatching && (
                        <div className="mobile-earning-stack">
                            <WatchEarningManager videoId={videoId} />
                        </div>
                    )}
                </div>

                <VideoPlayer
                    servers={servers}
                    downloads={downloads}
                    onPlay={() => setIsWatching(true)}
                />

                {children}

                {/* Real Download Links Section */}
                {downloads && downloads.length > 0 && (
                    <div className="mt-8 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Download className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Direct Downloads</h3>
                                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest">Choose your preferred quality</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {downloads.map((dl, i) => (
                                <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:border-white/10 transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-0.5 bg-primary/10 rounded-md text-[9px] font-black text-primary uppercase tracking-wider">
                                            {dl.format}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dl.links.map((link, j) => (
                                            <Link 
                                                key={j}
                                                href={`/download?url=${encodeURIComponent(link.link)}&title=${encodeURIComponent(videoId.replace(/-/g, ' '))}`}
                                                className="flex-1 min-w-[80px] px-3 py-2 bg-zinc-800 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all active:scale-95"
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <p className="mt-6 text-[9px] text-zinc-600 font-medium italic text-center">
                            Note: Downloads are hosted by external providers. Please use an ad-blocker for a smoother experience.
                        </p>
                    </div>
                )}

                {/* Related Anime Section - Matching Homepage Style */}
                {relatedAnime.length > 0 && (
                    <div className="mt-12 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Rekomendasi Untukmu
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                            {relatedAnime.map((anime, idx) => (
                                <AnimeCard 
                                    key={idx}
                                    id={idx}
                                    title={anime.title}
                                    image={anime.image}
                                    rating={parseFloat(anime.rating) || 0}
                                    episodes={parseInt(anime.eps) || 0}
                                    episodeRaw={anime.eps}
                                    type={anime.type || "Anime"}
                                    href={anime.link}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12">
                    <CommentSection videoId={videoId} />
                </div>
            </div>

        </div>
    );
}

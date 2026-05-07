"use client";

import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import WatchEarningManager from "./WatchEarningManager";
import { VideoServer } from "@/lib/anime";
import dynamic from "next/dynamic";
import AdUnit from "./ads/AdUnit";
import { List, X, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import AnimeCard from "./AnimeCard";

const CommentSection = dynamic(() => import("./CommentSection"), {
    loading: () => <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse mt-6">Memuat Komentar...</div>,
    ssr: false
});

interface WatchPageClientProps {
    servers: VideoServer[];
    videoId: string;
    children?: React.ReactNode;
    sidebar?: React.ReactNode;
    episodes?: any[];
    relatedAnime?: any[];
}

export default function WatchPageClient({ 
    servers, 
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
            {/* Mobile Episode Floating Button - AT THE BOTTOM */}
            <button 
                onClick={() => setShowEpisodes(true)}
                className="lg:hidden fixed bottom-6 right-6 z-[60] bg-primary text-black p-4 rounded-full shadow-2xl shadow-primary/40 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:scale-110 active:scale-95 transition-all"
            >
                <List className="w-5 h-5" />
                <span>Episodes</span>
            </button>

            {/* Mobile Episode Drawer Overlay */}
            {showEpisodes && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowEpisodes(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-[#0F0F11] border-t border-white/10 rounded-t-[40px] p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <List className="w-5 h-5 text-primary" />
                                Episode List
                            </h3>
                            <button 
                                onClick={() => setShowEpisodes(false)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {sidebar}
                        </div>
                    </div>
                </div>
            )}

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
                    onPlay={() => setIsWatching(true)}
                />

                {children}

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

            {/* Sidebar Area (Desktop only or hidden when drawer is open) */}
            {sidebar && (
                <div className="hidden lg:flex lg:w-80 flex-col gap-4 shrink-0">
                    {sidebar}
                </div>
            )}
        </div>
    );
}

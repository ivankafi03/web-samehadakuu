"use client";

import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import WatchEarningManager from "./WatchEarningManager";
import { VideoServer } from "@/lib/anime";
import dynamic from "next/dynamic";
import AdUnit from "./ads/AdUnit";

const CommentSection = dynamic(() => import("./CommentSection"), {
    loading: () => <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse mt-6">Memuat Komentar...</div>,
    ssr: false
});

interface WatchPageClientProps {
    servers: VideoServer[];
    videoId: string;
    children?: React.ReactNode;
    sidebar?: React.ReactNode;
}

export default function WatchPageClient({ servers, videoId, children, sidebar }: WatchPageClientProps) {
    const [isWatching, setIsWatching] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col">
                {/* Watch earning — only active when user has clicked Play */}
                <div className="empty:hidden mb-4">
                    {isWatching && <WatchEarningManager videoId={videoId} />}
                </div>

                <VideoPlayer
                    servers={servers}
                    onPlay={() => setIsWatching(true)}
                />

                {/* Bottom Banner - Below Player */}
                <div className="w-full flex justify-center mt-4">
                    <div className="w-full max-w-full overflow-hidden flex justify-center">
                        <AdUnit type="leaderboard" className="!justify-center" />
                    </div>
                </div>

                {children}

                <CommentSection videoId={videoId} />
            </div>

            {/* Sidebar Area */}
            {sidebar && (
                <div className="lg:w-80 flex flex-col gap-4 shrink-0">
                    {sidebar}
                </div>
            )}
        </div>
    );
}

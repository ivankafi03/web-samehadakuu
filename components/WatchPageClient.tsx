"use client";

import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import WatchEarningManager from "./WatchEarningManager";
import { VideoServer } from "@/lib/anime";
import dynamic from "next/dynamic";

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
        <div className="flex flex-col lg:flex-row gap-5">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col gap-5">
                {/* Watch earning — only active when user has clicked Play */}
                {isWatching && <WatchEarningManager videoId={videoId} />}

                <VideoPlayer
                    servers={servers}
                    onPlay={() => setIsWatching(true)}
                />

                {children}

                <CommentSection videoId={videoId} />
            </div>

            {/* Sidebar Area */}
            {sidebar && (
                <div className="lg:w-96 flex flex-col gap-6">
                    {sidebar}
                </div>
            )}
        </div>
    );
}

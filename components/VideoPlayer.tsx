"use client";

import React, { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { VideoServer } from "@/lib/anime";

interface VideoPlayerProps {
    servers: VideoServer[];
    onPlay?: () => void;
}

export default function VideoPlayer({ servers, onPlay }: VideoPlayerProps) {
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    const handleStart = () => {
        setIsStarted(true);
        if (onPlay) onPlay();
    };

    if (!servers || servers.length === 0) {
        return (
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-4">
                <p className="text-white/60">Gagal memuat video player.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Player Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group/player">
                {!isStarted ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all group-hover/player:bg-black/30">
                        <button
                            onClick={handleStart}
                            className="group/btn relative flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] group-hover/btn:scale-110 group-hover/btn:shadow-primary/50 transition-all duration-500">
                                <Play className="w-6 h-6 text-black fill-current ml-1" />
                            </div>
                            <div className="bg-white/10 border border-white/10 px-6 py-2 rounded-xl backdrop-blur-md">
                                <p className="text-white font-black text-xs uppercase tracking-[0.2em]">Mulai Menonton</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <iframe
                        src={servers[activeServerIndex].iframe}
                        className="w-full h-full"
                        allowFullScreen
                        frameBorder="0"
                    />
                )}
            </div>

            {/* Server Switcher */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Pilih Server Video</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none bg-primary/10 px-2 py-0.5 rounded-lg">HD Multi</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {servers.map((server, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveServerIndex(i)}
                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${i === activeServerIndex
                                ? "bg-white border-white text-black shadow-xl scale-105"
                                : "bg-black/40 border-white/5 text-zinc-500 hover:text-white hover:border-white/20"
                                }`}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

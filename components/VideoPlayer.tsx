"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import { VideoServer } from "@/lib/anime";
import { useSession } from "next-auth/react";
import AdUnit from "@/components/ads/AdUnit";

const DIRECT_LINK = "https://www.profitablecpmratenetwork.com/xzgfq5xkc8?key=55406436bb6e7d868ad1a2c1d9a3f4fc";

interface VideoPlayerProps {
    servers: VideoServer[];
    onPlay?: () => void;
}

export default function VideoPlayer({ servers, onPlay }: VideoPlayerProps) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [showAdOverlay, setShowAdOverlay] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const adContainerRef = useRef<HTMLDivElement>(null);
    const adLoaded = useRef(false);

    // Countdown timer for interstitial ad
    useEffect(() => {
        if (!showAdOverlay) return;
        if (countdown <= 0) {
            setShowAdOverlay(false);
            setIsStarted(true);
            if (onPlay) onPlay();
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [showAdOverlay, countdown, onPlay]);

    // Load ad into overlay when it appears
    useEffect(() => {
        if (!showAdOverlay || adLoaded.current || !adContainerRef.current) return;
        adLoaded.current = true;

        (window as any).atOptions = {
            key: "f16bab575f321c24cf6f7e82f039c85f",
            format: "iframe",
            height: 250,
            width: 300,
            params: {},
        };
        const script = document.createElement("script");
        script.src = "https://www.highperformanceformat.com/f16bab575f321c24cf6f7e82f039c85f/invoke.js";
        script.async = true;
        adContainerRef.current.appendChild(script);
    }, [showAdOverlay]);

    const handleStart = () => {
        // Admin langsung nonton tanpa iklan
        if (isAdmin) {
            setIsStarted(true);
            if (onPlay) onPlay();
            return;
        }
        // Klik 3: buka Direct Link di tab baru
        try { window.open(DIRECT_LINK, "_blank"); } catch (_) {}
        setCountdown(5);
        setShowAdOverlay(true);
    };

    const skipAd = () => {
        setShowAdOverlay(false);
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
            {/* Pre-play Interstitial Ad Overlay */}
            {showAdOverlay && (
                <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                    {/* Countdown ring */}
                    <div className="relative flex items-center justify-center w-20 h-20">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff10" strokeWidth="4" />
                            <circle
                                cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 5)}`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div className="text-center">
                            <p className="text-white text-2xl font-black leading-none">{countdown}</p>
                            <p className="text-zinc-500 text-[10px] leading-none mt-0.5">detik</p>
                        </div>
                    </div>

                    {/* Ad inside overlay */}
                    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl">
                        <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] text-center mb-3">Sponsor</p>
                        <div ref={adContainerRef} className="flex items-center justify-center min-w-[300px] min-h-[250px]" />
                    </div>

                    <button
                        onClick={skipAd}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs transition-all border border-white/8 hover:border-white/20 px-4 py-2 rounded-lg"
                    >
                        <X className="w-3 h-3" />
                        Lewati ({countdown}s)
                    </button>
                </div>
            )}

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

            {/* Banner iklan di bawah player */}
            <div className="w-full flex justify-center py-2">
                <div className="hidden md:block">
                    <AdUnit type="leaderboard" />
                </div>
                <div className="block md:hidden">
                    <AdUnit type="mobile" />
                </div>
            </div>
        </div>
    );
}

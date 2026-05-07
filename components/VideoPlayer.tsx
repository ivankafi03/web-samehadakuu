"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import { VideoServer } from "@/lib/anime";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import AdUnit from "@/components/ads/AdUnit";

const DIRECT_LINK = "https://www.profitablecpmratenetwork.com/xzgfq5xkc8?key=55406436bb6e7d868ad1a2c1d9a3f4fc";

interface VideoPlayerProps {
    servers: VideoServer[];
    onPlay?: () => void;
}

export default function VideoPlayer({ servers, onPlay }: VideoPlayerProps) {
    const pathname = usePathname() || "";
    const { data: session } = useSession();
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [showAdOverlay, setShowAdOverlay] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [clickCount, setClickCount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMidrollArmed, setIsMidrollArmed] = useState(false);
    const [firstClickArmed, setFirstClickArmed] = useState(true);
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
 
     // Mid-roll Recurring Ad Trap (Every 2 minutes for guests)
     useEffect(() => {
         if (!isStarted) return;

         const interval = setInterval(() => {
             setIsMidrollArmed(true);
         }, 120000); // 120 seconds = 2 minutes

         return () => clearInterval(interval);
     }, [isStarted]);

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
        // Admin di halaman admin skip iklan
        if (pathname.startsWith("/admin")) {
            setIsStarted(true);
            if (onPlay) onPlay();
            return;
        }

        if (clickCount < 1) {
            setIsProcessing(true);
            setClickCount(prev => prev + 1);
            try { window.open(DIRECT_LINK, "_blank"); } catch (_) {}
            
            // Reset processing state after a short delay
            setTimeout(() => {
                setIsProcessing(false);
            }, 1500);
            return;
        }

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
                    <div className="flex flex-col items-center gap-4 text-center px-6">
                        <div className="relative w-20 h-20">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff08" strokeWidth="5" />
                                <circle 
                                    cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="5" 
                                    strokeDasharray={`${2 * Math.PI * 34}`}
                                    strokeDashoffset={`${2 * Math.PI * 34 * (countdown / 5)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-white text-2xl font-black leading-none">{countdown}</span>
                                <span className="text-zinc-600 text-[9px] mt-0.5 uppercase tracking-widest">sec</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Loading Content...</h4>
                            <p className="text-[10px] text-zinc-500 font-medium">Please wait a moment while we prepare your video.</p>
                        </div>
                        <button 
                            onClick={skipAd}
                            disabled={countdown > 0}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${countdown > 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:scale-105 shadow-xl'}`}
                        >
                            Skip Ad
                        </button>
                    </div>

                    {/* Ad inside overlay */}
                    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl">
                        <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] text-center mb-3">Sponsor</p>
                        <div ref={adContainerRef} className="flex items-center justify-center min-w-[300px] min-h-[250px]" />
                    </div>
                </div>
            )}

            {/* Player Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl group/player">
                {/* First Click Ad Trap (Global Popunder) */}
                {isStarted && firstClickArmed && (
                    <div 
                        onClick={() => setFirstClickArmed(false)}
                        className="absolute inset-0 z-[26] cursor-pointer" 
                    />
                )}

                {/* Mid-roll Ad Trap Layer */}
                {isMidrollArmed && isStarted && (
                    <div 
                        onClick={() => {
                            try { window.open(DIRECT_LINK, "_blank"); } catch (_) {}
                            setIsMidrollArmed(false);
                        }}
                        className="absolute inset-0 z-[25] cursor-pointer" 
                    />
                )}

                {!isStarted ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all group-hover/player:bg-black/40">
                        <div className="flex flex-col items-center text-center px-4">
                            <Play className="w-10 h-10 md:w-16 md:h-16 text-white/20 mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tighter mb-1 md:mb-2">Ready to Watch?</h3>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-medium max-w-[180px] md:max-w-[200px] leading-relaxed mb-4 md:mb-6">
                                Prepare yourself for an amazing streaming experience.
                            </p>
                            <button 
                                onClick={handleStart}
                                disabled={isProcessing}
                                className="px-8 py-3 md:px-10 md:py-4 bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center gap-2 md:gap-3 group disabled:opacity-70 disabled:scale-100"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current group-hover:animate-pulse" />
                                        Start Video
                                    </>
                                )}
                            </button>
                        </div>
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
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Select Video Server</span>
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

            {/* Banner ads below server switcher */}
            <div className="w-full flex justify-center py-2 bg-white/5 rounded-xl border border-white/5">
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

"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Sparkles, TrendingUp, CheckCircle2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWidget } from "./WidgetContext";

export default function WatchProgressIndicator({
    duration = 60,
    onComplete
}: {
    duration?: number,
    onComplete?: () => void
}) {
    const [progress, setProgress] = useState(0);
    const [isClaimed, setIsClaimed] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);
    const [mounted, setMounted] = useState(false);
    const { setRewardVisible } = useWidget();
    const maxCycles = 3;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Report visibility to context
    useEffect(() => {
        setRewardVisible(true);
        return () => setRewardVisible(false);
    }, [setRewardVisible]);

    // Visibility API support
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsPaused(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (completedCycles >= maxCycles || isPaused) return;

        if (isClaimed) {
            const timeout = setTimeout(() => {
                setProgress(0);
                setIsClaimed(false);
                setCompletedCycles(prev => prev + 1);
            }, 3000); // Hide after 3 seconds
            return () => clearTimeout(timeout);
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + (100 / duration) / 10; // smooth 10fps
                if (next >= 100) {
                    clearInterval(interval);
                    setIsClaimed(true);
                    if (onComplete) onComplete();
                    return 100;
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration, onComplete, isClaimed, completedCycles, isPaused]);

    if (completedCycles >= maxCycles) {
        return (
            <div 
                className="fixed right-6 z-[90]"
                style={{ bottom: mounted && window.innerWidth < 1024 ? "100px" : "24px" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0F0F11]/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                    Limit Video Tercapai
                </motion.div>
            </div>
        );
    }

    return (
        <div 
            className="fixed right-6 z-[90] flex flex-col items-end gap-3"
            style={{ bottom: mounted && window.innerWidth < 1024 ? "100px" : "24px" }}
        >
            <AnimatePresence>
                {showTooltip && !isClaimed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-primary text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase tracking-widest mb-1 flex items-center gap-2"
                    >
                        <span>Menghitung Cuan... {Math.round(progress)}%</span>
                        <span className="bg-black/20 px-1.5 py-0.5 rounded text-[8px]">{completedCycles + 1}/{maxCycles}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                    {!isClaimed ? (
                        <motion.button
                            key="progress"
                            onClick={() => setIsPaused(!isPaused)}
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className={`relative w-14 h-14 bg-[#0F0F11]/80 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer group active:scale-90 transition-transform ${isPaused ? 'opacity-80' : ''}`}
                        >
                            {/* Outer Glow */}
                            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isPaused ? 'bg-orange-500/5' : 'bg-primary/5 group-hover:bg-primary/10'}`} />

                            {/* Circular Progress (SVG) */}
                            <svg className={`absolute inset-0 w-full h-full -rotate-90 transition-all ${isPaused ? 'drop-shadow-none' : 'drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]'}`} viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="6"
                                />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    fill="transparent"
                                    stroke={isPaused ? "rgba(255,255,255,0.2)" : "var(--color-primary, #FBBF24)"}
                                    strokeWidth="6"
                                    strokeDasharray="276.46"
                                    strokeDashoffset={276.46 - (276.46 * progress) / 100}
                                    strokeLinecap="round"
                                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                />
                            </svg>

                            <div className="relative z-10 flex flex-col items-center">
                                <AnimatePresence mode="wait">
                                    {isPaused ? (
                                        <motion.div
                                            key="paused"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <div className="flex gap-1">
                                                <div className="w-1 h-3.5 bg-zinc-500 rounded-full" />
                                                <div className="w-1 h-3.5 bg-zinc-500 rounded-full" />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="dollar"
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                        >
                                            <DollarSign className="w-5 h-5 text-primary group-hover:scale-110 transition-transform animate-pulse" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="claimed"
                            initial={{ scale: 0.5, y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{
                                scale: [0.5, 1.1, 1],
                                y: 0,
                                opacity: 1,
                                filter: "blur(0px)"
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Burst Effect */}
                            <motion.div
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                            />

                            <div className="bg-gradient-to-br from-primary to-amber-500 text-black px-4 py-2 rounded-xl font-black text-[9px] flex items-center gap-1.5 shadow-[0_10px_20px_rgba(251,191,36,0.3)] border border-primary/20 uppercase tracking-widest relative z-10 overflow-hidden group">
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                                />
                                <CheckCircle2 className="w-3 h-3 fill-black/10" />
                                <span>Saldo Ditambahkan</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

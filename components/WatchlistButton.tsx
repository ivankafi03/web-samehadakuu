"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Bookmark } from "lucide-react";
import { useToast } from "./ToastContext";

interface WatchlistButtonProps {
    anime: {
        id: string | number;
        title: string;
        image: string;
        type?: string;
        href?: string;
    };
    variant?: "default" | "icon";
    size?: "default" | "lg";
    className?: string;
}

export default function WatchlistButton({ anime, variant = "default", size = "default", className }: WatchlistButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setMounted(true);
        const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
        setIsSaved(saved.some((item: any) => item.title === anime.title));
    }, [anime.title]);

    const toggleWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
        let newSaved;

        if (isSaved) {
            newSaved = saved.filter((item: any) => item.title !== anime.title);
            showToast(`Dihapus dari Daftar Putar: ${anime.title}`, "info");
        } else {
            newSaved = [...saved, {
                ...anime,
                addedAt: new Date().toISOString()
            }];
            showToast(`Berhasil disimpan ke Daftar Putar!`, "success");
        }

        localStorage.setItem("watchlist", JSON.stringify(newSaved));
        setIsSaved(!isSaved);

        // Trigger generic storage event for other components
        window.dispatchEvent(new Event("storage"));
    };

    // Use a fixed initial state during SSR to avoid mismatch
    const currentIsSaved = mounted ? isSaved : false;

    if (variant === "icon") {
        return (
            <button
                onClick={toggleWatchlist}
                suppressHydrationWarning
                className={`flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center transition-all ${currentIsSaved ? "text-primary border-primary/30" : "text-white"} ${className}`}
                title={currentIsSaved ? "Hapus dari Daftar" : "Tambah ke Daftar"}
            >
                {currentIsSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
        );
    }

    const sizeClasses = size === "lg"
        ? "px-5 md:px-8 py-3 md:py-4 text-sm md:text-base"
        : "px-4 py-2 text-xs";

    return (
        <button
            onClick={toggleWatchlist}
            suppressHydrationWarning
            className={`${sizeClasses} rounded-xl font-semibold flex items-center gap-2 transition-all border ${currentIsSaved
                ? "bg-white border-white text-black shadow-xl"
                : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                } ${className}`}
        >
            {isSaved ? <Check className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} /> : <Bookmark className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />}
            {isSaved ? "Tersimpan" : "Daftar Putar"}
        </button>
    );
}

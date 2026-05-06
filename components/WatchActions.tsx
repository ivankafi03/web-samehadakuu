"use client";

import React, { useState } from "react";
import { ThumbsUp, Heart, Share2, Check, Loader2 } from "lucide-react";
import WatchlistButton from "./WatchlistButton";
import { useToast } from "./ToastContext";
import { useSession } from "next-auth/react";

interface WatchActionsProps {
    anime: {
        id: string;
        title: string;
        image: string;
        rating?: number;
        episodes?: number;
        type: string;
        href: string;
    };
}

export default function WatchActions({ anime }: WatchActionsProps) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(12400);
    const [collecting, setCollecting] = useState(false);
    const { showToast } = useToast();

    const handleLike = () => {
        if (liked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
            showToast("Terima kasih! Kamu menyukai episode ini.", "success");
        }
        setLiked(!liked);
    };

    const handleShareAndCollect = async () => {
        let shareUrl = window.location.origin + window.location.pathname;
        const user = session?.user as any;
        const isLoggedIn = !!user?.id;

        if (isLoggedIn) {
            shareUrl += `?ref=${user.id.substring(0, 8)}`;

            // Automatic Collection Logic
            setCollecting(true);
            try {
                await fetch("/api/links", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        videoId: anime.id,
                        videoTitle: anime.title,
                        videoUrl: shareUrl
                    })
                });
                // We don't necessarily show a separate toast for collecting to keep it clean
            } catch (err) {
                console.error("Auto-collect failed", err);
            } finally {
                setCollecting(false);
            }
        }

        navigator.clipboard.writeText(shareUrl);
        showToast(
            isLoggedIn ? "Link Cuan disalin & tersimpan di Dashboard!" : "Link berhasil disalin ke clipboard!",
            "success"
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all border ${liked
                    ? "bg-primary border-primary text-black shadow-lg shadow-primary/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    }`}
            >
                <ThumbsUp className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                {(likeCount / 1000).toFixed(1)}K
            </button>

            <WatchlistButton
                anime={anime}
                variant="default"
            />

            <button
                onClick={handleShareAndCollect}
                disabled={collecting}
                className="px-4 py-2 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all border bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-lg shadow-primary/5 group disabled:opacity-50"
            >
                {collecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />}
                {session ? "Salin Link Cuan" : "Bagikan"}
            </button>
        </div>
    );
}

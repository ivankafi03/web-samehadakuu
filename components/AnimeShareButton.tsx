"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { useToast } from "./ToastContext";
import { useSession } from "next-auth/react";

interface AnimeShareButtonProps {
    animeTitle: string;
    className?: string;
}

export default function AnimeShareButton({ animeTitle, className }: AnimeShareButtonProps) {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const user = (session?.user as any);
        let shareUrl = window.location.href;

        // Append referral code for logged-in users
        if (user?.id) {
            const baseUrl = window.location.origin + window.location.pathname;
            shareUrl = `${baseUrl}?ref=${user.id.substring(0, 8)}`;
        }

        // Try Web Share API first (mobile/supported browsers)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Nonton ${animeTitle} - Samehadakuu`,
                    text: `Tonton ${animeTitle} subtitle Indonesia gratis!`,
                    url: shareUrl,
                });
                showToast("Anime berhasil dibagikan!", "success");
                return;
            } catch (err) {
                // User cancelled share dialog, fallback to clipboard
                if ((err as Error).name === "AbortError") return;
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast(
                user?.id
                    ? "Link Cuan disalin — bagikan ke temanmu!"
                    : "Link berhasil disalin ke clipboard!",
                "success"
            );
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast("Gagal menyalin link.", "error");
        }
    };

    return (
        <button
            onClick={handleShare}
            title="Bagikan anime ini"
            className={`flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center transition-all group ${className ?? ""}`}
        >
            {copied
                ? <Check className="w-5 h-5 text-green-400" />
                : <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            }
        </button>
    );
}

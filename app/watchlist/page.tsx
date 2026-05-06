"use client";

import React, { useState, useEffect } from "react";
import AnimeCard from "@/components/AnimeCard";
import { Bookmark, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastContext";

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { confirm, showToast } = useToast();

    useEffect(() => {
        const loadWatchlist = () => {
            const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
            // Sort by addedAt descending
            const sorted = saved.sort((a: any, b: any) =>
                new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
            );
            setWatchlist(sorted);
            setIsLoading(false);
        };

        loadWatchlist();

        // Listen for storage changes
        window.addEventListener("storage", loadWatchlist);
        return () => window.removeEventListener("storage", loadWatchlist);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
                <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bookmark className="w-8 h-8 text-primary" />
                        Daftar Nonton Saya
                    </h1>
                    <p className="text-zinc-400">Tersimpan di perangkat kamu ({watchlist.length} anime)</p>
                </div>
                {watchlist.length > 0 && (
                    <button
                        onClick={async () => {
                            const ok = await confirm(
                                "Kosongkan Daftar?",
                                "Semua anime yang kamu simpan akan dihapus permanen dari perangkat ini."
                            );
                            if (ok) {
                                localStorage.setItem("watchlist", "[]");
                                setWatchlist([]);
                                window.dispatchEvent(new Event("storage"));
                                showToast("Daftar putar berhasil dikosongkan.", "info");
                            }
                        }}
                        className="text-xs font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-wider px-2 py-1 hover:bg-red-500/5 rounded-lg"
                    >
                        Kosongkan Daftar
                    </button>
                )}
            </div>

            {watchlist.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-4">
                    {watchlist.map((anime, i) => (
                        <AnimeCard
                            key={`${anime.title}-${i}`}
                            id={i}
                            title={anime.title}
                            image={anime.image}
                            rating={parseFloat(anime.rating) || 0}
                            episodes={parseInt(anime.episodes) || 0}
                            type={anime.type || "TV"}
                            href={anime.href}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                        <Bookmark className="w-10 h-10 text-zinc-600" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-white text-xl font-bold">Belum ada anime yang tersimpan.</p>
                        <p className="text-zinc-500 max-w-xs">
                            Cari anime favoritmu dan klik tombol "Daftar Putar" untuk menyimpannya di sini.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                        Cari Anime
                    </Link>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
    Play, 
    History, 
    Clock, 
    TrendingUp,
    ShieldCheck,
    Eye
} from "lucide-react";

export default function WatchClient({ user }: { user: any }) {
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        totalWatchtime: 0,
        avgRetention: 0,
        todayWatchEarnings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatchData = async () => {
            const [histRes, statsRes] = await Promise.all([
                fetch("/api/history?t=" + Date.now()),
                fetch("/api/member/stats?t=" + Date.now())
            ]);
            if (histRes.ok) setWatchHistory(await histRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            setLoading(false);
        };
        fetchWatchData();
    }, []);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">Watch <span className="text-primary">Analytics</span></h2>
                <p className="text-xs text-zinc-500">Statistik tontonan dan rewardmu.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Total Waktu</p>
                    <h3 className="text-xl font-bold text-white tracking-tighter">
                        {Math.floor(stats.totalWatchtime / 3600)}h {Math.floor((stats.totalWatchtime % 3600) / 60)}m
                    </h3>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Avg Retensi</p>
                    <h3 className="text-xl font-bold text-primary tracking-tighter">{stats.avgRetention}s</h3>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Watch Balance</p>
                    <h3 className="text-xl font-bold text-green-400 tracking-tighter">${(user?.balanceWatch || 0).toFixed(3)}</h3>
                </div>
            </div>

            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-blue-400" />
                        Watch History
                    </h3>
                    <span className="text-[9px] font-semibold text-zinc-600">{watchHistory.length} sesi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {watchHistory.length === 0 && !loading && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 gap-4">
                            <Play className="w-12 h-12 text-zinc-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No watch history found. Start watching now!</p>
                        </div>
                    )}
                    {watchHistory.map((video, idx) => (
                        <a 
                            key={idx} 
                            href={video.videoUrl} 
                            className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-bold text-zinc-500">{idx + 1}</span>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                                <h4 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{video.videoTitle}</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-wide">Verified View</span>
                                    <span className="text-[9px] text-zinc-700">·</span>
                                    <span className="text-[9px] text-zinc-600">{new Date(video.updatedAt).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

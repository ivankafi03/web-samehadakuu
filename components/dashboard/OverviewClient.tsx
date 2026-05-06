"use client";

import React, { useState, useEffect } from "react";
import { 
    DollarSign, 
    Trophy, 
    Crown, 
    Medal, 
    Rocket, 
    Copy,
    ChevronRight,
    Send,
    MessageCircle
} from "lucide-react";
import { useToast } from "../ToastContext";
import { proxyImage } from "@/lib/proxy-image";

export default function OverviewClient({ user }: { user: any }) {
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [origin, setOrigin] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const [rankRes, histRes, settRes] = await Promise.all([
                fetch("/api/ranking?period=daily&type=total"),
                fetch("/api/history?limit=5"),
                fetch("/api/admin/settings")
            ]);
            if (rankRes.ok) setRankingData(await rankRes.json());
            if (histRes.ok) setWatchHistory(await histRes.json());
            if (settRes.ok) setSettings(await settRes.json());
        };
        fetchData();
        setOrigin(window.location.origin);
    }, []);

    const totalBalance = (user?.balanceWatch || 0) + (user?.balanceReferral || 0);
    const userRankIdx = rankingData.findIndex(r => r.name === user?.name);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                    Halo, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
                </h2>
                <p className="text-xs text-zinc-500">Pantau performa dan pendapatanmu hari ini.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Balance Card */}
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between">
                                <p className="text-zinc-500 text-xs font-medium">Total Net Balance</p>
                                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/10">
                                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tighter">${totalBalance.toFixed(3)}</h3>
                            <div className="flex gap-6 pt-2 border-t border-white/5">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-medium text-zinc-500">Watch</span>
                                    <span className="text-sm font-bold text-white tracking-tight">${(user?.balanceWatch || 0).toFixed(3)}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-medium text-zinc-500">Referral</span>
                                    <span className="text-sm font-bold text-white tracking-tight">${(user?.balanceReferral || 0).toFixed(3)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rank Card */}
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-blue-500/20 transition-all">
                            <div className="flex items-center justify-between">
                                <p className="text-zinc-500 text-xs font-medium">Global Status</p>
                                <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/10">
                                    <Trophy className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                    {userRankIdx === 0 ? (
                                        <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                    ) : userRankIdx === 1 ? (
                                        <Medal className="w-7 h-7 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]" />
                                    ) : (
                                        <Medal className="w-7 h-7 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-3xl font-bold text-white tracking-tighter">
                                        #{userRankIdx >= 0 ? userRankIdx + 1 : '--'}
                                    </h3>
                                    <p className="text-[10px] font-medium text-zinc-500">Global Rank Position</p>
                                </div>
                            </div>
                            <a href="/dashboard/leaderboard" className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/10 hover:text-white transition-all">
                                Lihat Leaderboard <ChevronRight className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Telegram Community Banner */}
                        <div className="sm:col-span-2 bg-gradient-to-r from-blue-600/10 to-primary/5 border border-blue-500/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />
                            
                            <div className="flex items-center gap-4 z-10">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                                    <Send className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-white tracking-tight uppercase">Komunitas Official</h3>
                                    <p className="text-[10px] text-zinc-400 font-medium">Dapatkan info rilis, event, dan bantuan admin langsung.</p>
                                </div>
                            </div>

                            <a 
                                href={settings?.telegramLink || "https://t.me/samehadakuu_official"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                            >
                                JOIN TELEGRAM
                                <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Referral Promo */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-6 transition-transform shrink-0">
                                    <Rocket className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <h4 className="text-sm font-bold text-white">Boost Your Earnings</h4>
                                    <p className="text-xs text-primary/70 font-medium">Bagikan link referralmu &amp; raih reward lebih banyak.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-black/50 backdrop-blur border border-white/10 rounded-xl p-1.5 pl-4 w-full sm:w-auto sm:max-w-xs">
                                <code className="text-xs font-bold text-primary/80 truncate">{origin}/?ref={user?.id?.substring(0, 8)}</code>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${origin}/?ref=${user?.id?.substring(0, 8)}`);
                                        showToast("Referral link copied!", "success");
                                    }}
                                    className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-64 flex flex-col gap-3">
                    {/* Top Performers */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-white">Top Performers</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-1">
                            {rankingData.slice(0, 5).map((row, idx) => (
                                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/8 transition-all">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold w-4 ${idx === 0 ? 'text-primary' : 'text-zinc-600'}`}>#{idx + 1}</span>
                                        <span className="text-xs font-semibold text-white truncate w-20">{row.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">${row.earning.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        <h3 className="text-xs font-semibold text-white">Riwayat Terakhir</h3>
                        <div className="flex flex-col gap-2">
                            {watchHistory.slice(0, 3).map((video, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="w-6 h-6 rounded-md bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-zinc-500">{idx + 1}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-white truncate">{video.videoTitle}</span>
                                        <span className="text-[9px] text-zinc-600">Ditonton</span>
                                    </div>
                                </div>
                            ))}
                            {watchHistory.length === 0 && (
                                <p className="text-[10px] text-zinc-700 text-center py-3">Belum ada aktivitas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

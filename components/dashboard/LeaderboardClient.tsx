"use client";

import React, { useState, useEffect } from "react";
import { Trophy, ShieldCheck, Crown, Medal } from "lucide-react";

export default function LeaderboardClient({ user }: { user: any }) {
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [rankPeriod, setRankPeriod] = useState("daily");
    const [rankType, setRankType] = useState("total");
    const [loading, setLoading] = useState(true);

    const fetchRanking = async (period: string, type: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ranking?period=${period}&type=${type}&t=${Date.now()}`);
            if (res.ok) setRankingData(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRanking(rankPeriod, rankType); }, [rankPeriod, rankType]);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-bold text-white tracking-tight">World <span className="text-primary">Rankings</span></h2>
                    <p className="text-xs text-zinc-500">Bersaing dengan member lain dan raih posisi teratas.</p>
                </div>
                {/* Period filter */}
                <div className="flex p-0.5 bg-black/40 border border-white/5 rounded-xl w-full sm:w-auto">
                    {[
                        { id: 'daily', label: 'Hari' },
                        { id: 'weekly', label: 'Minggu' },
                        { id: 'alltime', label: 'Semua' }
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setRankPeriod(p.id)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${rankPeriod === p.id ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        <h3 className="text-[10px] font-semibold text-white uppercase tracking-wide">Kategori</h3>
                        {/* Mobile: horizontal scroll; Desktop: vertical */}
                        <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                            {[
                                { id: "total", label: "Global Points", color: "text-primary", dot: "bg-primary" },
                                { id: "watch", label: "Watch", color: "text-blue-500", dot: "bg-blue-500" },
                                { id: "referral", label: "Sharing", color: "text-green-500", dot: "bg-green-500" }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setRankType(cat.id)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all shrink-0 ${rankType === cat.id ? 'bg-white/5 border-white/15' : 'bg-transparent border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${cat.color}`}>{cat.label}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ml-2 ${rankType === cat.id ? cat.dot : 'bg-zinc-700'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ranking List */}
                <div className="lg:col-span-3 bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                    {/* Header row — hidden on mobile */}
                    <div className="hidden sm:grid grid-cols-12 px-3 text-[9px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                        <div className="col-span-2">Rank</div>
                        <div className="col-span-7">Member</div>
                        <div className="col-span-3 text-right">Earning</div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {loading ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-30">
                                <Trophy className="w-8 h-8 animate-pulse" />
                                <p className="text-xs font-semibold uppercase tracking-wide">Memuat ranking...</p>
                            </div>
                        ) : rankingData.map((row, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${row.name === user?.name ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                {/* Rank number */}
                                <div className="w-8 shrink-0">
                                    <span className={`text-sm font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-orange-500' : 'text-zinc-600'}`}>
                                        #{idx + 1}
                                    </span>
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs shrink-0 border border-white/5 ${idx === 0 ? 'text-primary' : 'text-zinc-500'}`}>
                                        {idx === 0 ? <Crown className="w-4 h-4" /> : row.name?.substring(0, 1)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-xs font-semibold truncate ${row.name === user?.name ? 'text-white' : 'text-white/80'}`}>
                                            {row.name}
                                            {row.name === user?.name && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full ml-1.5">YOU</span>}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                                            <span className="text-[8px] text-blue-400 uppercase tracking-wide">Verified</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Earning */}
                                <div className="text-right shrink-0">
                                    <span className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-zinc-400'}`}>
                                        ${row.earning.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

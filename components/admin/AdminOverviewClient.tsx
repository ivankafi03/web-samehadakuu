"use client";

import React, { useState, useEffect } from "react";
import { 
    Users, 
    BarChart3, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp,
    Play,
    AreaChart as AreaChartIcon,
    History,
} from "lucide-react";
import dynamic from "next/dynamic";
import { proxyImage } from "@/lib/proxy-image";

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function AdminOverviewClient({ initialData }: { initialData: any }) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [rankPeriod, setRankPeriod] = useState("daily");
    const [rankType, setRankType] = useState("total");

    useEffect(() => {
        const fetchData = async () => {
            const [chartRes, rankRes, histRes, wdRes] = await Promise.all([
                fetch("/api/admin/chart-data"),
                fetch(`/api/ranking?period=${rankPeriod}&type=${rankType}`),
                fetch("/api/history?limit=10"),
                fetch("/api/admin/withdrawals?status=PENDING")
            ]);
            if (chartRes.ok) setChartData(await chartRes.json());
            if (rankRes.ok) setRankingData(await rankRes.json());
            if (histRes.ok) setWatchHistory(await histRes.json());
            if (wdRes.ok) {
                const wds = await wdRes.json();
                setPendingWithdrawals(wds.length);
            }
        };
        fetchData();
    }, [rankPeriod, rankType]);

    const stats = [
        { label: "Total Members", value: initialData.memberCount.toLocaleString(), icon: Users, color: "text-blue-400" },
        { label: "Revenue 7d", value: `$${chartData.reduce((acc, curr) => acc + curr.earnings, 0).toFixed(2)}`, icon: BarChart3, color: "text-purple-400" },
        { label: "Payouts 7d", value: `$${chartData.reduce((acc, curr) => acc + (curr.payouts || 0), 0).toFixed(2)}`, icon: CheckCircle2, color: "text-green-400" },
        { label: "Pending Payouts", value: pendingWithdrawals.toString(), icon: AlertCircle, color: "text-primary" },
    ];

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Admin <span className="text-primary">Overview</span></h2>
                <p className="text-xs text-zinc-500">Platform Management &amp; Global Control</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0F0F11] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/5`}>
                                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                            </div>
                            <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-zinc-600 font-semibold border border-white/5">LIVE</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-zinc-500 text-[10px] font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <AreaChartIcon className="w-3.5 h-3.5 text-primary" />
                            Global Financial Analytics
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-medium">Network Earnings vs Approved Distributions</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Gross Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Net Payouts</span>
                        </div>
                    </div>
                </div>

                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#3f3f46" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{fontWeight: 700}}
                            />
                            <YAxis 
                                stroke="#3f3f46" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                tick={{fontWeight: 700}}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F0F11', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}
                                cursor={{ stroke: '#ffffff10' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="earnings" 
                                stroke="#e11d48" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorEarnings)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="payouts" 
                                stroke="#3f3f46" 
                                strokeWidth={1.5}
                                fill="transparent" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Rankings Sidebar */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Member Performance</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex p-0.5 bg-black/40 border border-white/5 rounded-lg">
                            {['daily', 'weekly', 'alltime'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setRankPeriod(p)}
                                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all ${rankPeriod === p ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto no-scrollbar">
                            {rankingData.map((row, idx) => (
                                <div key={idx} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold w-5 ${idx === 0 ? 'text-primary' : 'text-zinc-700'}`}>#{idx + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-white truncate w-28">{row.name}</span>
                                            <span className="text-[9px] text-zinc-600">Verified</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-primary">${row.earning.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Activity */}
                <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-primary" />
                        Live Platform Traffic
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {watchHistory.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20 gap-3">
                                <History className="w-8 h-8" />
                                <p className="text-xs font-medium">No activity recorded.</p>
                            </div>
                        ) : (
                            watchHistory.map((video, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl group hover:border-white/10 transition-all">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-zinc-500">{idx + 1}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{video.videoTitle}</h4>
                                        <p className="text-[10px] text-zinc-600">{new Date(video.updatedAt).toLocaleTimeString()}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[9px] text-zinc-500">Live Hit</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart3,
    Settings,
    Users,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ExternalLink,
    ShieldAlert,
    ShieldCheck,
    ShieldOff,
    UserX,
    Save,
    Loader2,
    History,
    Check,
    UserCheck,
    X,
    Play,
    Globe,
    Search,
    Hammer,
    Power,
    Banknote,
    TrendingUp,
    MessageSquare,
    Trash2,
    AreaChart as AreaChartIcon
} from "lucide-react";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

import { DashboardSkeleton } from "./Skeletons";

const BatikPattern = ({ opacity = 0.1 }: { opacity?: number }) => (
    <div className="absolute inset-0 bg-batik-modern pointer-events-none overflow-hidden" style={{ opacity }} />
);

export default function AdminDashboard({ data }: { data: any }) {
    const [settings, setSettings] = useState({
        cpmRate: 1.50,
        skimRate: 0.20,
        watchRate: 0.005,
        minWithdrawal: 50.00,
        registrationBonus: 0.10,
        maintenanceMode: false,
        maintenanceMessage: "Situs sedang dalam pemeliharaan rutin untuk meningkatkan performa."
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("overview"); // overview, payouts, settings, members
    const [members, setMembers] = useState<any[]>([]);
    const [blockedIps, setBlockedIps] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [rankPeriod, setRankPeriod] = useState("daily");
    const [rankType, setRankType] = useState("total"); // total, watch, referral

    // Personal stats & Admin data state
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const { showToast } = useToast();

    const stats = [
        { label: "Total Members", value: data?.memberCount || "0", icon: Users, color: "text-blue-400" },
        { label: "Revenue 7d", value: `$${chartData.reduce((acc, curr) => acc + curr.earnings, 0).toFixed(2)}`, icon: BarChart3, color: "text-purple-400" },
        { label: "Payouts 7d", value: `$${chartData.reduce((acc, curr) => acc + curr.payouts, 0).toFixed(2)}`, icon: CheckCircle2, color: "text-green-400" },
        { label: "Pending Requests", value: withdrawalRequests.filter(r => r.status === 'PENDING').length.toString(), icon: AlertCircle, color: "text-primary" },
    ];

    const fetchRanking = async (period: string, type: string = "total") => {
        try {
            const res = await fetch(`/api/ranking?period=${period}&type=${type}&t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRankingData(data);
            }
        } catch (e) {
            console.error("Ranking fetch error", e);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch(`/api/admin/withdrawals?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setWithdrawalRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch admin withdrawals", err);
        }
    };

    const fetchChatMessages = async () => {
        try {
            const res = await fetch("/api/chat");
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
            }
        } catch (error) {
            console.error("Chat fetch error", error);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                if (res.ok) {
                    const json = await res.json();
                    setSettings({
                        cpmRate: json.cpmRate,
                        skimRate: json.skimRate,
                        watchRate: json.watchRate,
                        minWithdrawal: json.minWithdrawal,
                        registrationBonus: json.registrationBonus || 0.10,
                        maintenanceMode: json.maintenanceMode || false,
                        maintenanceMessage: json.maintenanceMessage || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            } finally {
                setLoading(false);
            }
        };
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/history?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setWatchHistory(data);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        };

        const fetchMembers = async () => {
            try {
                const res = await fetch("/api/admin/members");
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data);
                }
            } catch (err) {
                console.error("Failed to fetch members", err);
            }
        };

        const fetchBlockedIps = async () => {
            try {
                const res = await fetch("/api/admin/blocked-ips");
                if (res.ok) setBlockedIps(await res.json());
            } catch (err) {
                console.error("Failed to fetch blocked IPs", err);
            }
        };

        const fetchChartData = async () => {
            try {
                const res = await fetch("/api/admin/chart-data");
                if (res.ok) setChartData(await res.json());
            } catch (err) {
                console.error("Failed to fetch chart data", err);
            }
        };

        fetchSettings();
        fetchHistory();
        fetchWithdrawals();
        fetchMembers();
        fetchBlockedIps();
        fetchRanking(rankPeriod, rankType);
        fetchChatMessages();
        fetchChartData();
    }, []);

    // Tab switcher for Ranking
    useEffect(() => {
        fetchRanking(rankPeriod, rankType);
    }, [rankPeriod, rankType]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                showToast("Settings saved successfully!", "success");
            } else {
                showToast("Error saving settings.", "error");
            }
        } catch (err) {
            showToast("Network error.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleWithdrawalStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/withdrawals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                showToast(`Request ${status.toLowerCase()} successfully`, "success");
                fetchWithdrawals(); // Refresh list
            } else {
                showToast("Failed to update status", "error");
            }
        } catch (err) {
            showToast("Network error", "error");
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-base font-bold text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-zinc-500 mt-0.5 text-xs uppercase tracking-wider">Platform Management</p>
                </div>
                <div className="flex gap-3">
                    <div className={`px-3 py-1.5 border rounded-xl text-xs font-black flex items-center gap-2 uppercase tracking-widest transition-all ${settings.maintenanceMode ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {settings.maintenanceMode ? <Hammer className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {settings.maintenanceMode ? 'Maintenance ON' : 'System Secure'}
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar py-0.5">
                {[
                    { id: "overview", label: "Statistik", icon: BarChart3 },
                    { id: "payouts", label: "Pembayaran", icon: Banknote },
                    { id: "members", label: "Member", icon: Users },
                    { id: "chat", label: "Chat", icon: MessageSquare },
                    { id: "settings", label: "Konfigurasi", icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tabbed Content */}
            {activeTab === "overview" && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-[#0F0F11] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-0.5">
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-zinc-500 uppercase font-bold tracking-widest">Live</span>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                        <BatikPattern opacity={0.05} />
                        <div className="flex items-center justify-between z-10">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <AreaChartIcon className="w-4 h-4 text-primary" />
                                    Financial Performance (Last 7 Days)
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Earnings vs Approved Payouts</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black text-white uppercase">Earnings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                    <span className="text-[10px] font-black text-white uppercase">Payouts</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-[250px] w-full z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#52525b" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{fontWeight: 'bold'}}
                                    />
                                    <YAxis 
                                        stroke="#52525b" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                        tick={{fontWeight: 'bold'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0F0F11', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="earnings" 
                                        stroke="#fbbf24" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorEarnings)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="payouts" 
                                        stroke="#52525b" 
                                        strokeWidth={2}
                                        fill="transparent" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Ranking Section */}
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden shadow-xl">
                            <div className="p-5 pb-0 flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-xl">
                                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                                        {rankType === 'watch' ? 'Top Watchers' : rankType === 'referral' ? 'Top Influencers' : 'Top Earners'}
                                    </h3>
                                </div>

                                {/* Category Switcher */}
                                <div className="flex gap-2">
                                    {[
                                        { id: 'total', label: 'All', color: 'bg-primary' },
                                        { id: 'watch', label: 'Watch', color: 'bg-blue-500' },
                                        { id: 'referral', label: 'Ref', color: 'bg-green-500' }
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setRankType(cat.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${rankType === cat.id ? `${cat.color} text-black border-transparent shadow-lg font-bold` : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex p-0.5 bg-black/50 border border-white/5 rounded-xl">
                                    {['daily', 'weekly', 'alltime'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setRankPeriod(p)}
                                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${rankPeriod === p ? 'bg-white text-black shadow-xl' : 'text-zinc-600 hover:text-white'}`}
                                        >
                                            {p === 'alltime' ? 'Global' : p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 pt-4">
                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
                                    {rankingData.map((row, idx) => (
                                        <div
                                            key={idx}
                                            className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl transition-all ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'}`}
                                        >
                                            <div className="col-span-2 text-xs font-black text-zinc-500">#{row.rank}</div>
                                            <div className="col-span-6 flex flex-col">
                                                <span className="text-xs font-black text-white uppercase truncate">{row.name}</span>
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Gold Tier</span>
                                            </div>
                                            <div className="col-span-4 text-right text-xs font-black text-white">${row.earning.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Admin Activity (Personal Watch History) */}
                        <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xl">
                            <BatikPattern opacity={0.1} />
                            <div className="flex justify-between items-center mb-5 relative z-10">
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                                        <Play className="w-3.5 h-3.5 text-primary" />
                                        Platform Watch Metrics
                                    </h3>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar flex flex-col gap-2 relative z-10">
                                {watchHistory.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4 opacity-30">
                                        <History className="w-8 h-8 text-zinc-600" />
                                        <p className="text-zinc-600 font-bold text-center text-[10px] uppercase tracking-widest">No recent watch history.</p>
                                    </div>
                                ) : (
                                    watchHistory.map((video, idx) => (
                                        <a key={idx} href={video.videoUrl} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                            <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                                                <img src={video.videoImage} className="w-full h-full object-cover grayscale" alt="" />
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <h4 className="text-[10px] font-black text-white/90 uppercase truncate leading-tight">{video.videoTitle}</h4>
                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Hit: {new Date(video.updateAt || video.updatedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "payouts" && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-center mb-5 relative z-10">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-green-400" />
                                Withdrawal Management
                            </h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar flex flex-col gap-2 relative z-10">
                        {withdrawalRequests.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                                <Banknote className="w-10 h-10 text-zinc-600" />
                                <p className="text-zinc-600 font-bold text-center text-[10px] uppercase tracking-widest">No requests pending.</p>
                            </div>
                        ) : (
                            withdrawalRequests.map((req, idx) => (
                                <div key={idx} className="p-4 bg-black/60 border border-white/5 rounded-2xl flex flex-col gap-4 hover:border-white/10 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {req.user?.name?.substring(0, 1) || "U"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white uppercase tracking-tight">{req.user?.name}</span>
                                                <span className="text-[9px] font-medium text-zinc-500">{req.user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end">
                                            <span className="text-lg font-bold text-green-400 leading-none">${req.amount.toFixed(2)}</span>
                                            <span className="text-[9px] text-zinc-600 mt-0.5">{new Date(req.createdAt).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Target</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase">{req.method}</span>
                                                <span className="text-xs font-mono text-white/80">{req.accountNumber}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase truncate mt-0.5">{req.accountName}</span>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            {req.status === 'PENDING' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleWithdrawalStatus(req.id, 'REJECTED')}
                                                        className="px-4 py-2.5 bg-red-500/10 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-widest border border-red-500/10"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleWithdrawalStatus(req.id, 'APPROVED')}
                                                        className="px-4 py-2.5 bg-white text-black text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-xl"
                                                    >
                                                        Approve
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rates Config */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
                        <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" />
                            Revenue Configuration
                        </h3>

                        <div className="space-y-6">
                            {/* Maintenance Mode Toggle */}
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${settings.maintenanceMode ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                            <Power className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-black text-white uppercase tracking-widest">Maintenance Mode</span>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`w-12 h-6 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-zinc-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                {settings.maintenanceMode && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">Announcement Message</span>
                                        <textarea
                                            value={settings.maintenanceMessage}
                                            onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-zinc-400 font-medium focus:outline-none focus:border-orange-500/30 min-h-[100px] resize-none"
                                            placeholder="Tulis pesan perbaikan..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* CPM Field */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-zinc-500">Referral CPM</span>
                                        <span className="text-primary font-mono">${settings.cpmRate.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range" min="0.1" max="10" step="0.1"
                                        value={settings.cpmRate}
                                        onChange={(e) => setSettings({ ...settings, cpmRate: parseFloat(e.target.value) })}
                                        className="w-full accent-primary bg-black h-1 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Skim Rate Field */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-zinc-500">Skim Rate</span>
                                        <span className="text-red-500 font-mono">{Math.round(settings.skimRate * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={settings.skimRate}
                                        onChange={(e) => setSettings({ ...settings, skimRate: parseFloat(e.target.value) })}
                                        className="w-full accent-red-500 bg-black h-1 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Watch Rate */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Watch Rate (Per Min)</span>
                                    <input
                                        type="number" step="0.0001"
                                        value={settings.watchRate}
                                        onChange={(e) => setSettings({ ...settings, watchRate: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>

                                {/* Min Withdrawal */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Min Withdrawal (USD)</span>
                                    <input
                                        type="number" step="1"
                                        value={settings.minWithdrawal}
                                        onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl mt-2 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? "Updating..." : "Save Configuration"}
                        </button>
                    </div>

                    {/* Quick Guide */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <h3 className="font-black text-white uppercase tracking-widest text-xs">System Insights</h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-bold">
                            Rates yang Anda atur akan langsung berdampak pada estimasi pendapatan member secara real-time. Pastikan Anda telah melakukan perhitungan profit margin sebelum mengubah konfigurasi.
                        </p>
                        <div className="pt-2 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Payout Processor Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Database Backup Sync: OK</span>
                            </div>
                        </div>
                    </div>
                    {/* Blocked IPs Panel */}
                    <div className="bg-[#0F0F11] border border-red-500/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                <ShieldOff className="w-4 h-4 text-red-500" />
                                IP Yang Diblokir
                            </h3>
                            <button
                                onClick={async () => {
                                    const res = await fetch('/api/admin/blocked-ips');
                                    if (res.ok) { const d = await res.json(); setBlockedIps(d); }
                                }}
                                className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                                title="Refresh list"
                            >
                                <History className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {blockedIps.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <ShieldCheck className="w-8 h-8 text-green-500/30" />
                                <p className="text-[11px] text-zinc-600 font-bold">Tidak ada IP yang diblokir saat ini</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {blockedIps.map((entry: any) => (
                                    <div key={entry.id} className="flex items-center justify-between gap-4 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3 hover:bg-red-500/10 transition-all">
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-xs font-black text-red-400 font-mono">{entry.ip}</span>
                                            {entry.reason && <span className="text-[10px] text-zinc-500 truncate">{entry.reason}</span>}
                                            <span className="text-[9px] text-zinc-700">{new Date(entry.createdAt).toLocaleString('id-ID')}</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!confirm(`Hapus blokir IP ${entry.ip}?`)) return;
                                                await fetch('/api/admin/blocked-ips', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: entry.ip }) });
                                                setBlockedIps((prev: any[]) => prev.filter((b: any) => b.ip !== entry.ip));
                                                showToast(`IP ${entry.ip} diunblok`, 'success');
                                            }}
                                            className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all shrink-0"
                                            title="Hapus blokir"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "members" && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Member Management
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Verified Network Access</p>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Cari Member..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] text-left">
                                    <th className="px-4 pb-2">User</th>
                                    <th className="px-4 pb-2">Watch</th>
                                    <th className="px-4 pb-2">Ref</th>
                                    <th className="px-4 pb-2">Total</th>
                                    <th className="px-4 pb-2">Status</th>
                                    <th className="px-4 pb-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.filter(m =>
                                    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((member, idx) => (
                                    <tr key={idx} className={`group transition-all ${member.isFlagged ? 'bg-red-500/5 hover:bg-red-500/10' : 'bg-black/40 hover:bg-black/60'}`}>
                                        <td className={`px-4 py-3 rounded-l-xl border-y border-l transition-all ${member.isFlagged ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase ${member.isFlagged ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {member.name?.substring(0, 1)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-black text-white uppercase truncate max-w-[120px]">{member.name}</span>
                                                    <span className="text-[9px] font-bold text-zinc-600 truncate max-w-[120px]">{member.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 border-y transition-all ${member.isFlagged ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            <span className="text-xs font-black text-white font-mono">${member.balanceWatch.toFixed(2)}</span>
                                        </td>
                                        <td className={`px-4 py-3 border-y transition-all ${member.isFlagged ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            <span className="text-xs font-black text-white font-mono">${member.balanceReferral.toFixed(2)}</span>
                                        </td>
                                        <td className={`px-4 py-3 border-y transition-all ${member.isFlagged ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            <span className="text-xs font-black text-primary font-mono">${(member.balanceWatch + member.balanceReferral).toFixed(2)}</span>
                                        </td>
                                        <td className={`px-4 py-3 border-y transition-all ${member.isFlagged ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            {member.isSuspended ? (
                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 w-fit">
                                                    <UserX className="w-2.5 h-2.5" /> Suspended
                                                </span>
                                            ) : member.isFlagged ? (
                                                <div className="flex flex-col gap-0.5" title={member.flagReason || ''}>
                                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black rounded uppercase tracking-wider w-fit flex items-center gap-1">
                                                        <ShieldAlert className="w-2.5 h-2.5" /> Flagged
                                                    </span>
                                                    {member.flagReason && (
                                                        <span className="text-[8px] text-red-400/60 truncate max-w-[140px]">{member.flagReason}</span>
                                                    )}
                                                </div>
                                            ) : members.filter(m => m.deviceFingerprint === member.deviceFingerprint && m.deviceFingerprint).length > 1 ? (
                                                <div className="flex flex-col gap-0.5" title="Detected multiple accounts on this device">
                                                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 w-fit">
                                                        <AlertCircle className="w-2.5 h-2.5" /> Multi-Acc
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 w-fit">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Clear
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 rounded-r-xl border-y border-r transition-all text-right ${member.isFlagged || member.isSuspended ? 'border-red-500/20' : 'border-white/5 group-hover:border-white/10'}`}>
                                            <div className="flex justify-end gap-2">
                                                {member.isSuspended ? (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`Aktifkan kembali akun ${member.name}?`)) return;
                                                            await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'unsuspend' }) });
                                                            setMembers(prev => prev.map(m => m.id === member.id ? {...m, isSuspended: false, isFlagged: false, flagReason: null} : m));
                                                            showToast(`Akun ${member.name} diaktifkan kembali`, 'success');
                                                        }}
                                                        className="p-2 bg-green-500/10 rounded-lg hover:bg-green-500/20 text-green-500 transition-all" title="Aktifkan kembali"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : member.isFlagged ? (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'unflag' }) });
                                                                setMembers(prev => prev.map(m => m.id === member.id ? {...m, isFlagged: false, flagReason: null} : m));
                                                                showToast('Member diunflag', 'success');
                                                            }}
                                                            className="p-2 bg-green-500/10 rounded-lg hover:bg-green-500/20 text-green-500 transition-all" title="Unflag member"
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                        </button>
                                                        {member.registrationIp && member.registrationIp !== 'unknown' && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm(`Blokir IP ${member.registrationIp}? Semua akun dari IP ini tidak bisa akses web.`)) return;
                                                                    await fetch('/api/admin/blocked-ips', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ip: member.registrationIp, reason: `Diblokir dari akun ${member.email}` }) });
                                                                    showToast(`IP ${member.registrationIp} diblokir!`, 'success');
                                                                }}
                                                                className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-500 transition-all" title="Blokir IP ini"
                                                            >
                                                                <ShieldOff className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Suspend akun ${member.name}? Mereka tidak bisa login lagi.`)) return;
                                                                await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'suspend' }) });
                                                                setMembers(prev => prev.map(m => m.id === member.id ? {...m, isSuspended: true} : m));
                                                                showToast(`Akun ${member.name} disuspend!`, 'success');
                                                            }}
                                                            className="p-2 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 text-orange-500 transition-all" title="Suspend akun"
                                                        >
                                                            <UserX className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : null}
                                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white text-zinc-500 transition-all">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Card View (Mobile) */}
                    <div className="md:hidden flex flex-col gap-3">
                        {members.filter(m =>
                            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((member, idx) => (
                            <div key={idx} className={`border rounded-xl p-4 flex flex-col gap-3 ${
                                member.isSuspended ? 'bg-orange-500/5 border-orange-500/20'
                                : member.isFlagged ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-black/40 border-white/5'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                                        member.isSuspended ? 'bg-orange-500/20 text-orange-400'
                                        : member.isFlagged ? 'bg-red-500/20 text-red-400'
                                        : 'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        {member.name?.substring(0, 1)}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white uppercase truncate">{member.name}</span>
                                            {member.isSuspended && <UserX className="w-3 h-3 text-orange-400 shrink-0" />}
                                            {!member.isSuspended && member.isFlagged && <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />}
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-500 truncate">{member.email}</span>
                                        {member.isFlagged && member.flagReason && (
                                            <span className="text-[9px] text-red-400/70 truncate mt-0.5">{member.flagReason}</span>
                                        )}
                                        {members.filter(m => m.deviceFingerprint === member.deviceFingerprint && m.deviceFingerprint).length > 1 && !member.isFlagged && (
                                            <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest mt-0.5">Multi-Account Detected</span>
                                        )}
                                    </div>
                                    <div className="flex gap-1.5">
                                        {member.isSuspended ? (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Aktifkan kembali akun ${member.name}?`)) return;
                                                    await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'unsuspend' }) });
                                                    setMembers(prev => prev.map(m => m.id === member.id ? {...m, isSuspended: false, isFlagged: false, flagReason: null} : m));
                                                    showToast(`Akun ${member.name} diaktifkan kembali`, 'success');
                                                }}
                                                className="p-2 bg-green-500/10 rounded-lg text-green-500"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </button>
                                        ) : member.isFlagged ? (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'unflag' }) });
                                                        setMembers(prev => prev.map(m => m.id === member.id ? {...m, isFlagged: false, flagReason: null} : m));
                                                        showToast('Member diunflag', 'success');
                                                    }}
                                                    className="p-2 bg-green-500/10 rounded-lg text-green-500"
                                                >
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </button>
                                                {member.registrationIp && member.registrationIp !== 'unknown' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`Blokir IP ${member.registrationIp}?`)) return;
                                                            await fetch('/api/admin/blocked-ips', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ip: member.registrationIp, reason: `Diblokir dari akun ${member.email}` }) });
                                                            showToast(`IP ${member.registrationIp} diblokir!`, 'success');
                                                        }}
                                                        className="p-2 bg-red-500/10 rounded-lg text-red-500"
                                                    >
                                                        <ShieldOff className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm(`Suspend akun ${member.name}?`)) return;
                                                        await fetch('/api/admin/members', { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId: member.id, action: 'suspend' }) });
                                                        setMembers(prev => prev.map(m => m.id === member.id ? {...m, isSuspended: true} : m));
                                                        showToast(`Akun ${member.name} disuspend!`, 'success');
                                                    }}
                                                    className="p-2 bg-orange-500/10 rounded-lg text-orange-500"
                                                >
                                                    <UserX className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        ) : null}
                                        <button className="p-2 bg-white/5 rounded-lg text-zinc-500">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase">Watch</span>
                                        <span className="text-xs font-black text-white font-mono">${member.balanceWatch.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase">Ref</span>
                                        <span className="text-xs font-black text-white font-mono">${member.balanceReferral.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black text-zinc-600 uppercase">Total</span>
                                        <span className="text-xs font-black text-primary font-mono">${(member.balanceWatch + member.balanceReferral).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "chat" && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col relative overflow-hidden group shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                Community Chat History
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Latest 50 Messages</p>
                        </div>
                        <button onClick={fetchChatMessages} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <History className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                        {chatMessages.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-20 gap-3">
                                <MessageSquare className="w-10 h-10" />
                                <p className="text-xs font-black uppercase">Belum ada percakapan.</p>
                            </div>
                        ) : (
                            [...chatMessages].reverse().map((msg, idx) => (
                                <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-4 group/msg hover:border-white/10 transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs uppercase ${msg.isAdmin ? 'bg-primary/20 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {msg.user?.name?.substring(0, 1)}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-black uppercase ${msg.isAdmin ? 'text-primary' : 'text-white'}`}>{msg.user?.name}</span>
                                                <span className="text-[9px] text-zinc-600 font-bold">{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover/msg:opacity-100 transition-all">
                                        <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

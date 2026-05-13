"use client";

import React, { useState, useEffect } from "react";
import {
    Eye,
    Users,
    Clock,
    DollarSign,
    Wallet,
    Share2,
    ArrowUpRight,
    Copy,
    Trash2,
    Check,
    Plus,
    Link as LinkIcon,
    History,
    Trophy,
    Crown,
    Medal,
    ShieldCheck,
    ChevronRight,
    TrendingUp,
    Calendar,
    Globe,
    Play,
    LayoutDashboard,
    PieChart,
    Rocket,
    Banknote
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./ToastContext";
import WithdrawModal from "./WithdrawModal";

// Beautiful In-lined Batik Pattern Component
const BatikPattern = ({ opacity = 0.1 }: { opacity?: number }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="batikKawung" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <circle cx="40" cy="40" r="38" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                    <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
                    <path d="M40 0v80M0 40h80" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
                    <circle cx="80" cy="0" r="20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
                    <circle cx="0" cy="80" r="20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
                    <circle cx="80" cy="80" r="20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#batikKawung)" />
        </svg>
    </div>
);

export default function MemberDashboard({ user }: { user: any }) {
    const [collectedLinks, setCollectedLinks] = useState<any[]>([]);
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview"); // overview, watch, share, leaderboard, payouts
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [rankPeriod, setRankPeriod] = useState("daily");
    const [rankType, setRankType] = useState("total");
    const [timeRange, setTimeRange] = useState("today");
    const [settings, setSettings] = useState<any>(null);
    const [realStats, setRealStats] = useState<any>({
        todayViews: 0,
        todayReferralViews: 0,
        todayEarnings: 0,
        todayWatchEarnings: 0,
        todayReferralEarnings: 0,
        totalWatchtime: 0,
        avgRetention: 0
    });
    const [origin, setOrigin] = useState("");
    const [copying, setCopying] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { showToast } = useToast();

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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

    useEffect(() => {
        const fetchLinks = async () => {
            const res = await fetch(`/api/links?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCollectedLinks(data);
            }
        };
        const fetchHistory = async () => {
            const res = await fetch(`/api/history?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setWatchHistory(data);
            }
        };
        const fetchSettings = async () => {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        };
        const fetchWithdrawals = async () => {
            const res = await fetch(`/api/withdraw?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setWithdrawalHistory(data);
            }
        };

        const fetchStats = async () => {
            const res = await fetch(`/api/member/stats?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRealStats(data);
            }
        };

        fetchLinks();
        fetchHistory();
        fetchSettings();
        fetchWithdrawals();
        fetchStats();
        fetchRanking(rankPeriod);
        setOrigin(typeof window !== 'undefined' ? window.location.origin : "");
    }, []);

    useEffect(() => {
        const type = activeTab === "watch" ? "watch" : activeTab === "share" ? "referral" : rankType;
        fetchRanking(rankPeriod, type);
    }, [rankPeriod, activeTab, rankType]);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === collectedLinks.length && collectedLinks.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(collectedLinks.map(l => l.id)));
        }
    };

    const copySelectedLinks = () => {
        setCopying(true);
        const linksToCopy = selectedIds.size > 0
            ? collectedLinks.filter(l => selectedIds.has(l.id))
            : collectedLinks;

        const text = linksToCopy.map(l => `${l.videoTitle}: ${l.videoUrl}`).join("\n");
        navigator.clipboard.writeText(text);
        setTimeout(() => setCopying(false), 2000);
    };

    const handleDeleteClick = () => {
        if (collectedLinks.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        const isClearingAll = selectedIds.size === 0 || selectedIds.size === collectedLinks.length;
        setClearing(true);
        try {
            const res = await fetch("/api/links", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            if (res.ok) {
                if (isClearingAll) {
                    setCollectedLinks([]);
                    setSelectedIds(new Set());
                } else {
                    setCollectedLinks(prev => prev.filter(l => !selectedIds.has(l.id)));
                    setSelectedIds(new Set());
                }
            }
        } catch (e) {
            console.error("Delete failed", e);
        } finally {
            setClearing(false);
        }
    };

    const stats = [
        { label: "Today Views", value: realStats.todayViews.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Referral Views", value: realStats.todayReferralViews.toLocaleString(), icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
        { label: "Daily Earnings", value: `$${realStats.todayEarnings.toFixed(3)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
        { label: "Total Watchtime", value: `${Math.floor(realStats.totalWatchtime / 60)}m`, icon: Clock, color: "text-zinc-400", bg: "bg-zinc-400/10" },
    ];

    const totalBalance = (user?.balanceWatch || 0) + (user?.balanceReferral || 0);

    const deleteModalTitle = selectedIds.size === 0 || selectedIds.size === collectedLinks.length
        ? "Bersihkan Semua Link?"
        : `Hapus ${selectedIds.size} Link?`;

    const deleteModalMessage = selectedIds.size === 0 || selectedIds.size === collectedLinks.length
        ? "Tindakan ini akan menghapus seluruh daftar link yang telah kamu kumpulkan. Data tidak bisa dikembalikan."
        : `Kamu akan menghapus ${selectedIds.size} link yang terpilih dari koleksi kamu. Lanjutkan?`;

    return (
        <div className="flex flex-col gap-4 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-zinc-400 mt-0.5 text-xs">Monitoring Network & Payouts</p>
                </div>
                <div className="flex items-center gap-2 bg-[#111113] border border-white/5 p-1 rounded-xl">
                    <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wide animate-pulse">Network: Optimal</div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                {[
                    { id: "overview", label: "Overview", icon: LayoutDashboard },
                    { id: "watch", label: "Watch", icon: Play },
                    { id: "share", label: "Share", icon: Share2 },
                    { id: "leaderboard", label: "Ranking", icon: Trophy },
                    { id: "payouts", label: "Payouts", icon: Banknote }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all relative shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-4">
                        {/* Welcome Space */}
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-base font-bold text-white">Welcome, {user?.name?.split(' ')[0] || 'Member'}!</h2>
                            <p className="text-xs text-zinc-400">{activeTab === 'overview' ? 'Summary of your growth statistics today.' : `${activeTab} analytics.`}</p>
                        </div>

                        {/* Overview Content */}
                        {activeTab === "overview" && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/20 transition-all shadow-xl">
                                        <BatikPattern opacity={0.05} />
                                        <div className="flex items-center justify-between z-10">
                                            <p className="text-zinc-500 text-sm font-bold ">Total Net Balance</p>
                                            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-4 h-4 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-bold text-white tracking-tighter z-10">${totalBalance.toFixed(3)}</h3>
                                        <div className="flex gap-6 z-10">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-zinc-500 ">Watch Reward</span>
                                                <span className="text-sm font-bold text-white/90 tracking-tight">${(user?.balanceWatch || 0).toFixed(3)}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-zinc-500 ">Network Bonus</span>
                                                <span className="text-sm font-bold text-white/90 tracking-tight">${(user?.balanceReferral || 0).toFixed(3)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ranking Badge Card */}
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-blue-500/20 transition-all shadow-xl">
                                        <BatikPattern opacity={0.05} />
                                        <div className="flex items-center justify-between z-10">
                                            <p className="text-zinc-500 text-sm font-bold ">Current Standing</p>
                                            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                <Trophy className="w-4 h-4 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 z-10">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                                {rankingData.findIndex(r => r.name === user?.name) === 0 ? (
                                                    <Crown className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                                ) : rankingData.findIndex(r => r.name === user?.name) === 1 ? (
                                                    <Medal className="w-7 h-7 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]" />
                                                ) : (
                                                    <Medal className="w-7 h-7 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-2xl font-bold text-white tracking-tighter">
                                                    #{rankingData.findIndex(r => r.name === user?.name) + 1 || '--'}
                                                </h3>
                                                <p className="text-xs font-bold text-zinc-500 ">Global Rank Position</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 z-10">
                                            <button onClick={() => setActiveTab("leaderboard")} className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-zinc-400  hover:bg-white/10 hover:text-white transition-all">View Leaderboard</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Prominent Referral Box */}
                                <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-6 transition-transform">
                                                <Rocket className="w-7 h-7 fill-current" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-lg font-bold text-white tracking-tight">Boost Your Earnings!</h4>
                                                <p className="text-xs text-primary/80 font-bold uppercase tracking-wide">Get a bonus every time someone joins via your link.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-2 pl-4 max-w-md w-full md:w-auto">
                                            <code className="text-xs font-bold text-primary/60 truncate">{origin}/?ref={user?.id?.substring(0, 8)}</code>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${origin}/?ref=${user?.id?.substring(0, 8)}`);
                                                    showToast("Referral link copied!", "success");
                                                }}
                                                className="px-4 py-2.5 bg-primary text-white font-bold text-sm  rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                                            >
                                                <Copy className="w-3.5 h-3.5" /> Copy Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Studio Analytics for Watch & Share */}
                        {(activeTab === "watch" || activeTab === "share") && (
                            <div className="flex flex-col gap-4">
                                {/* Time Filter */}
                                <div className="flex p-0.5 bg-black/40 border border-white/5 rounded-xl w-fit">
                                    {[
                                        { id: 'today', label: 'Today' },
                                        { id: '7days', label: '7 Days' },
                                        { id: 'month', label: 'This Month' },
                                        { id: 'all', label: 'All Time' }
                                    ].map(range => (
                                        <button key={range.id} onClick={() => setTimeRange(range.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${timeRange === range.id ? 'bg-white text-black shadow' : 'text-zinc-500 hover:text-white'}`}>
                                            {range.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Studio Stats Grid â€” 2 col on mobile, 4 on lg */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-white/10 transition-all">
                                        <p className="text-zinc-400 text-xs font-medium">Total {activeTab === 'watch' ? 'Watched' : 'Videos'}</p>
                                        <h3 className="text-2xl font-bold text-white">{activeTab === 'watch' ? watchHistory.length : collectedLinks.length}</h3>
                                    </div>
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-white/10 transition-all">
                                        <p className="text-zinc-400 text-xs font-medium">Views Total</p>
                                        <h3 className="text-2xl font-bold text-primary">{activeTab === 'watch' ? watchHistory.length : collectedLinks.reduce((acc, l) => acc + (l.viewCount || 0), 0)}</h3>
                                    </div>
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-white/10 transition-all">
                                        <p className="text-zinc-400 text-xs font-medium">Earning Total</p>
                                        <h3 className="text-2xl font-bold text-green-400">${activeTab === 'watch' ? (user?.balanceWatch || 0).toFixed(2) : (user?.balanceReferral || 0).toFixed(2)}</h3>
                                    </div>
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-white/10 transition-all">
                                        <p className="text-zinc-400 text-xs font-medium">Available Balance</p>
                                        <h3 className="text-2xl font-bold text-white">${(activeTab === 'watch' ? (user?.balanceWatch || 0) : (user?.balanceReferral || 0)).toFixed(2)}</h3>
                                    </div>
                                </div>

                                {/* Deep Stats Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                                        <BatikPattern opacity={0.05} />
                                        <div className="flex flex-col gap-1 z-10">
                                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Watchtime Insights</h4>
                                            <p className="text-sm font-semibold text-white">All Time</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 z-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500">Total Duration</span>
                                                <h5 className="text-2xl font-bold text-white">{Math.floor(realStats.totalWatchtime / 3600)}h {Math.floor((realStats.totalWatchtime % 3600) / 60)}m</h5>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-zinc-500">Avg Retention</span>
                                                <h5 className="text-2xl font-bold text-primary">{realStats.avgRetention}s</h5>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-white/5 z-10 flex items-center justify-between">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-zinc-500">Avg Retention Rate</span>
                                                <span className="text-sm font-medium text-white">{realStats.avgRetention}s from 10s minimum</span>
                                            </div>
                                            <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((realStats.avgRetention / 60) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Views Sidebar */}
                                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white ">Live Views</h4>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-[8px] font-bold text-red-500 ">Live</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Active Referrals</p>
                                            <span className="text-2xl font-black text-white tracking-tighter">{user?.referralsCount || 0}</span>
                                            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">Total Users</p>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center py-4 border-y border-white/5 border-dashed">
                                            <p className="text-xs text-zinc-700 text-center">No active viewers currently</p>
                                        </div>
                                        <div className="flex flex-col gap-1 pt-2">
                                            <span className="text-xs font-bold text-white ">0</span>
                                            <span className="text-[7px] font-bold text-zinc-500 ">Total views today</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Lists */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(activeTab === "share") && (
                                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="w-3.5 h-3.5 text-primary" />
                                                    <h3 className="text-sm font-semibold text-white">Collection</h3>
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Your Balance</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-white tracking-tighter">Rp {user?.balance?.toLocaleString('id-ID')}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-zinc-400">{selectedIds.size > 0 ? `${selectedIds.size} Selected` : `${collectedLinks.length} Links`}</span>
                                            </div>
                                            <div className="overflow-y-auto max-h-[280px] flex flex-col gap-2 custom-scrollbar">
                                                {collectedLinks.map((link, idx) => (
                                                    <div key={idx} onClick={() => toggleSelect(link.id)} className={`flex items-center justify-between p-4 border rounded-2xl transition-all cursor-pointer ${selectedIds.has(link.id) ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-black/40 border-white/5'}`}>
                                                        <div className="flex items-center gap-3 truncate">
                                                            <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${selectedIds.has(link.id) ? 'bg-primary border-primary' : 'border-zinc-800'}`}>
                                                                {selectedIds.has(link.id) && <Check className="w-2.5 h-2.5 text-white stroke-[4]" />}
                                                            </div>
                                                            <span className="text-sm font-bold text-white/80 uppercase truncate">{link.videoTitle}</span>
                                                        </div>
                                                        <span className="text-xs font-mono text-zinc-600 ml-4 shrink-0">{link.viewCount || 0}v</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(activeTab === "watch") && (
                                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-3">
                                                <History className="w-3.5 h-3.5 text-blue-400" />
                                                <h3 className="text-sm font-semibold text-white">History</h3>
                                                <span className="text-xs text-zinc-400 ml-auto">Recent Watch</span>
                                            </div>
                                            <div className="overflow-y-auto max-h-[280px] flex flex-col gap-2 custom-scrollbar">
                                                {watchHistory.map((video, idx) => (
                                                    <a key={idx} href={video.videoUrl} className="flex items-center gap-3 p-2.5 bg-black/20 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                                        <img src={video.videoImage} className="w-9 h-9 rounded-lg object-cover grayscale opacity-50" />
                                                        <div className="flex flex-col gap-0.5 truncate">
                                                            <span className="text-xs font-semibold text-white truncate">{video.videoTitle}</span>
                                                            <span className="text-xs text-zinc-500">Watched</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === "leaderboard" && (
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                                    <BatikPattern opacity={0.07} />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl"><Trophy className="w-4 h-4 text-primary" /></div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white">Samehadakuu Rankings</h3>
                                                <p className="text-xs text-zinc-400">Arena Terkuat Para Member</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[
                                                { id: "total", label: "Global", color: "bg-primary" },
                                                { id: "watch", label: "Watch", color: "bg-blue-500" },
                                                { id: "referral", label: "Share", color: "bg-green-500" }
                                            ].map((cat) => (
                                                <button key={cat.id} onClick={() => setRankType(cat.id)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${rankType === cat.id ? `${cat.color} text-black shadow` : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 border-b border-white/5 relative z-10">
                                        {['daily', 'weekly', 'alltime'].map((p) => (
                                            <button key={p} onClick={() => setRankPeriod(p)} className={`pb-3 text-xs font-medium transition-all relative ${rankPeriod === p ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
                                                {p === 'alltime' ? 'Eternity' : p}
                                                {rankPeriod === p && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                    <div className="hidden sm:grid grid-cols-12 px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                                        <div className="col-span-2">Rank</div>
                                        <div className="col-span-6">Member</div>
                                        <div className="col-span-4 text-right">Points / USD</div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {rankingData.map((row, idx) => (
                                            <div key={idx} className={`flex sm:grid sm:grid-cols-12 items-center gap-3 px-3 py-3 rounded-xl transition-all ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'}`}>
                                                <div className="sm:col-span-2 shrink-0">
                                                    <span className={`text-sm font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-orange-500' : 'text-zinc-600'}`}>#{idx + 1}</span>
                                                </div>
                                                <div className="sm:col-span-6 flex items-center gap-2 min-w-0 flex-1">
                                                    <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-semibold text-xs shrink-0 ${idx === 0 ? 'border border-primary/30 text-primary' : 'text-zinc-500'}`}>{row.name?.substring(0, 1)}</div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-white truncate">{row.name}</span>
                                                        <div className="flex items-center gap-1 opacity-60">
                                                            <ShieldCheck className="w-3 h-3 text-blue-400" />
                                                            <span className="text-xs text-blue-400">Verified</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sm:col-span-4 text-right ml-auto sm:ml-0">
                                                    <span className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-zinc-400'}`}>${row.earning.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "payouts" && (
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                                    <BatikPattern opacity={0.07} />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Banknote className="w-4 h-4 text-green-500" /> Penarikan Saldo</h3>
                                            <p className="text-xs text-zinc-400">Cairkan poin Anda ke uang tunai.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500 mb-0.5">Saldo Dapat Ditarik</p>
                                            <h4 className="text-2xl font-bold text-white">${totalBalance.toFixed(3)}</h4>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 z-10">
                                        <button onClick={() => setIsWithdrawModalOpen(true)} className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                            <Rocket className="w-3.5 h-3.5" /> Withdraw Balance
                                        </button>
                                        <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                            <PieChart className="w-3.5 h-3.5 text-primary" />
                                            <div className="flex flex-col"><span className="text-xs font-semibold text-white">Min. Withdrawal</span><span className="text-xs text-zinc-500">${settings?.minWithdrawal || 50}.00</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-zinc-500" /> Riwayat Transaksi</h3>
                                    <div className="flex flex-col gap-2">
                                        {withdrawalHistory.map((wd, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${wd.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : wd.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}><Banknote className="w-4 h-4" /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-white">{wd.method} â€¢ {wd.accountNumber}</span>
                                                        <span className="text-xs text-zinc-500">{new Date(wd.createdAt).toLocaleString()} â€¢ {wd.accountName}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-bold block ${wd.status === 'APPROVED' ? 'text-green-500' : wd.status === 'REJECTED' ? 'text-red-500' : 'text-orange-500'}`}>${wd.amount.toFixed(2)}</span>
                                                    <span className={`text-xs ${wd.status === 'APPROVED' ? 'text-green-500/70' : 'text-zinc-500'}`}>{wd.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {withdrawalHistory.length === 0 && <div className="flex flex-col items-center justify-center py-12 opacity-30"><LayoutDashboard className="w-8 h-8 mb-2" /><p className="text-xs">Belum ada catatan penarikan.</p></div>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === "overview" && (
                    <div className="lg:w-96 flex flex-col gap-6">
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white ">Global Top Earners</h3>
                                <button onClick={() => setActiveTab("leaderboard")} className="text-xs font-bold text-primary  hover:underline">Full List</button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {rankingData.slice(0, 5).map((row, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-zinc-600">#{idx + 1}</span>
                                            <span className="text-xs font-bold text-white uppercase truncate w-20">{row.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-primary">${row.earning.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                            <h3 className="text-xs font-bold text-white ">Recent Hits</h3>
                            <div className="flex flex-col gap-3">
                                {watchHistory.slice(0, 3).map((video, idx) => (
                                    <a key={idx} href={video.videoUrl} className="flex items-center gap-3 group">
                                        <img src={video.videoImage} className="w-10 h-10 rounded-lg object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-white uppercase truncate">{video.videoTitle}</span>
                                            <span className="text-sm text-zinc-500 font-bold ">Recorded Hit</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} balance={totalBalance} minWithdrawal={settings?.minWithdrawal || 50.00} onSuccess={() => { }} />
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title={deleteModalTitle} message={deleteModalMessage} />
        </div>
    );
}

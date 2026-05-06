"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Check, X, Loader2 } from "lucide-react";
import { useToast } from "../ToastContext";

export default function AdminPayoutsClient() {
    const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch(`/api/admin/withdrawals?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                // Sort: PENDING first, then by date descending
                const sorted = data.sort((a: any, b: any) => {
                    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setWithdrawalRequests(sorted);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleWithdrawalStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/withdrawals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                showToast(`Request ${status.toLowerCase()} successfully`, "success");
                fetchWithdrawals();
            } else {
                showToast("Failed to update status", "error");
            }
        } catch (err) {
            showToast("Network error", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Payout <span className="text-primary">Management</span></h2>
                <p className="text-sm text-zinc-500 font-medium">Global Distribution Queue & Financial Auditing.</p>
            </div>

            <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-batik-modern opacity-[0.02] pointer-events-none" />
                
                <div className="flex items-center justify-between z-10 mb-2">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-green-400" />
                        Distribution Queue
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-600">
                            {withdrawalRequests.filter(r => r.status === 'PENDING').length} Requests Needing Action
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 z-10">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Synchronizing Queue...</p>
                        </div>
                    ) : withdrawalRequests.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                            <Banknote className="w-12 h-12 text-zinc-600" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">Queue is empty. <br /> All payouts have been processed.</p>
                        </div>
                    ) : (
                        withdrawalRequests.map((req, idx) => (
                            <div key={idx} className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col gap-6 hover:border-white/10 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                                            {req.user?.name?.substring(0, 1)}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-base font-bold text-white tracking-tight">{req.user?.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-600 font-medium">{req.user?.email}</span>
                                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                <span className="text-[10px] font-semibold text-blue-500 uppercase">Verified Member</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-3xl font-extrabold text-green-400 tracking-tighter leading-none">${req.amount.toFixed(2)}</span>
                                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-1">{new Date(req.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4 bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
                                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center shrink-0">
                                            <Banknote className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Payment Method</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-bold rounded uppercase tracking-widest">{req.method}</span>
                                                <span className="text-[10px] font-mono font-bold text-white truncate">{req.accountNumber}</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase truncate mt-0.5">{req.accountName}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        {req.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleWithdrawalStatus(req.id, 'REJECTED')}
                                                    className="px-6 py-4 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-2xl hover:bg-red-500/20 transition-all uppercase tracking-[0.2em] border border-red-500/10"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleWithdrawalStatus(req.id, 'APPROVED')}
                                                    className="px-8 py-4 bg-white text-black text-[10px] font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-2xl shadow-white/10"
                                                >
                                                    Process Distribution
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                                                {req.status === 'APPROVED' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                {req.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}

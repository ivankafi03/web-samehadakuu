"use client";

import React, { useState, useEffect } from "react";
import { 
    Gift, 
    Send, 
    Trash2, 
    Power, 
    Loader2, 
    Plus, 
    Sparkles, 
    Users, 
    CheckCircle2,
    MessageSquare,
    DollarSign
} from "lucide-react";
import { useToast } from "../ToastContext";

export default function AdminBroadcastsClient() {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newBroadcast, setNewBroadcast] = useState({
        title: "",
        message: "",
        amount: 0.10
    });
    const { showToast } = useToast();

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch("/api/admin/broadcasts");
            if (res.ok) setBroadcasts(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBroadcast.title || !newBroadcast.message) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/broadcasts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBroadcast)
            });

            if (res.ok) {
                showToast("Broadcast reward sent to all members!", "success");
                setNewBroadcast({ title: "", message: "", amount: 0.10 });
                fetchBroadcasts();
            } else {
                showToast("Failed to create broadcast", "error");
            }
        } catch (err) {
            showToast("Network error", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/admin/broadcasts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !currentStatus })
            });
            if (res.ok) fetchBroadcasts();
        } catch (e) {
            showToast("Failed to update status", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the broadcast and all claim history.")) return;
        
        try {
            const res = await fetch(`/api/admin/broadcasts?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Broadcast deleted", "success");
                fetchBroadcasts();
            }
        } catch (e) {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Gift className="w-8 h-8 text-primary" />
                    Broadcast <span className="text-primary">Rewards</span>
                </h2>
                <p className="text-sm text-zinc-500 font-medium">Kirim bonus saldo kejutan ke semua member aktif.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-primary" /> New Broadcast
                        </h3>
                        <form onSubmit={handleCreate} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Notification Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bonus Weekend! 🎁"
                                    value={newBroadcast.title}
                                    onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Message</label>
                                <textarea
                                    placeholder="Tulis pesan penyemangat..."
                                    value={newBroadcast.message}
                                    onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Amount (USD)</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newBroadcast.amount}
                                        onChange={(e) => setNewBroadcast({ ...newBroadcast, amount: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 mt-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Broadcast Now
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-batik-modern opacity-[0.02] pointer-events-none" />
                        
                        <div className="p-8">
                            <h3 className="text-sm font-bold text-white mb-6">Active & Past Broadcasts</h3>
                            <div className="flex flex-col gap-4">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Loading Rewards...</p>
                                    </div>
                                ) : broadcasts.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                                        <Gift className="w-12 h-12" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada broadcast bonus.</p>
                                    </div>
                                ) : (
                                    broadcasts.map((b) => (
                                        <div key={b.id} className={`p-6 rounded-[2rem] border transition-all flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between ${b.isActive ? 'bg-primary/5 border-primary/20' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${b.isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-zinc-800 text-zinc-600'}`}>
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-white">{b.title}</h4>
                                                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">${b.amount.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 font-medium line-clamp-1">{b.message}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {b._count.claims} Claims
                                                        </span>
                                                        <span className="text-[9px] font-bold text-zinc-600">
                                                            {new Date(b.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleStatus(b.id, b.isActive)}
                                                    className={`p-3 rounded-xl transition-all ${b.isActive ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                                    title={b.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(b.id)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

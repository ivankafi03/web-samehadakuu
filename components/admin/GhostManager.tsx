"use client";

import React, { useState, useEffect } from "react";
import { Users, Play, Loader2, RefreshCw, Trash2, ShieldCheck, Ghost } from "lucide-react";
import { useToast } from "../ToastContext";

export default function GhostManager() {
    const [ghosts, setGhosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const { showToast } = useToast();

    const fetchGhosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/ghosts");
            if (res.ok) {
                const data = await res.json();
                setGhosts(data);
            }
        } catch (e) {
            showToast("Failed to fetch ghosts", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGhosts();
    }, []);

    const createGhosts = async (count: number) => {
        setCreating(true);
        try {
            const res = await fetch("/api/admin/ghosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count })
            });
            if (res.ok) {
                showToast(`Created ${count} ghost members`, "success");
                fetchGhosts();
            }
        } catch (e) {
            showToast("Failed to create ghosts", "error");
        } finally {
            setCreating(false);
        }
    };

    const simulateActivity = async () => {
        setSimulating(true);
        try {
            const res = await fetch("/api/admin/ghosts/simulate", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                showToast(`Simulated activity for ${data.updatedCount} ghosts`, "success");
                fetchGhosts();
            }
        } catch (e) {
            showToast("Simulation failed", "error");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                        <Ghost className="w-6 h-6 text-purple-400" />
                        Ghost <span className="text-primary">Network</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">Manage seeded members and simulate organic activity.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={simulateActivity}
                        disabled={simulating || ghosts.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20 transition-all font-bold text-xs"
                    >
                        {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        Simulate Activity
                    </button>
                    <button
                        onClick={() => createGhosts(10)}
                        disabled={creating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all font-bold text-xs"
                    >
                        {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Deploy 10 Ghosts
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-70">Active Population</span>
                    <span className="text-2xl font-bold text-white tracking-tight">{ghosts.length}</span>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-70">Ghost Balance</span>
                    <span className="text-2xl font-bold text-purple-400 tracking-tight">
                        ${ghosts.reduce((acc, curr) => acc + (curr.balanceWatch || 0), 0).toFixed(2)}
                    </span>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-1 hover:border-white/10 transition-colors sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-70">Network Status</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-400 tracking-tight">SECURE</span>
                        <ShieldCheck className="w-5 h-5 text-green-500/50" />
                    </div>
                </div>
            </div>

            <div className="bg-[#0F0F11] border border-white/5 rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-batik-modern opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-all" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Ghost Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Endpoint</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">Balance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary opacity-20" />
                                    </td>
                                </tr>
                            ) : ghosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-zinc-600 font-bold text-sm">
                                        No ghost members deployed. Start by deploying a squad.
                                    </td>
                                </tr>
                            ) : (
                                ghosts.map((ghost) => (
                                    <tr key={ghost.id} className="group/row hover:bg-white/[0.015] transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                                                    {ghost.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-white">{ghost.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-mono text-zinc-500 opacity-60">{ghost.email}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-bold text-purple-400">${ghost.balanceWatch.toFixed(4)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-500/10">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                Active
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

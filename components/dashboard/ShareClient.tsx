"use client";

import React, { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Copy, Trash2, Check, Rocket, AlertCircle } from "lucide-react";
import { useToast } from "../ToastContext";
import ConfirmModal from "../ConfirmModal";

export default function ShareClient({ user }: { user: any }) {
    const [collectedLinks, setCollectedLinks] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying, setCopying] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchLinks = async () => {
            const res = await fetch(`/api/links?t=${Date.now()}`);
            if (res.ok) setCollectedLinks(await res.json());
        };
        fetchLinks();
    }, []);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleConfirmDelete = async () => {
        setClearing(true);
        try {
            const res = await fetch("/api/links", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            if (res.ok) {
                if (selectedIds.size === 0 || selectedIds.size === collectedLinks.length) {
                    setCollectedLinks([]);
                } else {
                    setCollectedLinks(prev => prev.filter(l => !selectedIds.has(l.id)));
                }
                setSelectedIds(new Set());
                showToast("Links removed successfully", "success");
            }
        } catch {
            showToast("Failed to remove links", "error");
        } finally {
            setClearing(false);
            setIsDeleteModalOpen(false);
        }
    };

    const copySelectedLinks = () => {
        setCopying(true);
        const linksToCopy = selectedIds.size > 0
            ? collectedLinks.filter(l => selectedIds.has(l.id))
            : collectedLinks;
        if (linksToCopy.length === 0) {
            showToast("No links to copy!", "error");
            setCopying(false);
            return;
        }
        const text = linksToCopy.map(l => `${l.videoTitle}: ${l.videoUrl}`).join("\n");
        navigator.clipboard.writeText(text);
        showToast(`Copied ${linksToCopy.length} links!`, "success");
        setTimeout(() => setCopying(false), 1000);
    };

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-bold text-white tracking-tight">Cuan <span className="text-primary">Studio</span></h2>
                    <p className="text-xs text-zinc-500">Kelola dan bagikan link untuk dapat bonus jaringan.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={copySelectedLinks}
                        disabled={copying || collectedLinks.length === 0}
                        className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wide rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {copying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {selectedIds.size > 0 ? `Copy (${selectedIds.size})` : 'Copy All'}
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={clearing || collectedLinks.length === 0}
                        className="p-2 bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Collection */}
                <div className="md:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5 text-primary" />
                            Koleksi Link
                        </h3>
                        <button
                            onClick={() => setSelectedIds(selectedIds.size === collectedLinks.length ? new Set() : new Set(collectedLinks.map(l => l.id)))}
                            className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide hover:text-white transition-colors"
                        >
                            {selectedIds.size === collectedLinks.length ? 'Batalkan' : 'Pilih Semua'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
                        {collectedLinks.length === 0 && (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30 gap-3">
                                <LinkIcon className="w-8 h-8 text-zinc-600" />
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-center">Belum ada link. Tonton video untuk kumpulkan link!</p>
                            </div>
                        )}
                        {collectedLinks.map((link, idx) => (
                            <div
                                key={idx}
                                onClick={() => toggleSelect(link.id)}
                                className={`flex items-center gap-3 p-3 border rounded-xl transition-all cursor-pointer ${selectedIds.has(link.id) ? 'bg-primary/10 border-primary/30' : 'bg-black/40 border-white/5 hover:border-white/15'}`}
                            >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${selectedIds.has(link.id) ? 'bg-primary border-primary' : 'bg-black/40 border-white/10'}`}>
                                    {selectedIds.has(link.id) && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-white truncate">{link.videoTitle}</span>
                                    <span className="text-[9px] text-zinc-600">Hits: {link.viewCount || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 h-fit">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Aturan Earning</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Rocket className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold text-white uppercase">Network Bonus</span>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">Komisi untuk setiap tayangan unik dari linkmu.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold text-white uppercase">Kebijakan Ketat</span>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">Dilarang bot atau proxy. Akun pelanggar diblokir.</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                        <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">Referral Balance</p>
                        <h4 className="text-2xl font-bold text-white tracking-tighter">${(user?.balanceReferral || 0).toFixed(3)}</h4>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={selectedIds.size > 0 ? `Hapus ${selectedIds.size} Link?` : "Hapus Semua?"}
                message="Tindakan ini tidak bisa dibatalkan."
            />
        </div>
    );
}

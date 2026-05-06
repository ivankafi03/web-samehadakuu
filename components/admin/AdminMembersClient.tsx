"use client";

import React, { useState, useEffect } from "react";
import { 
    Users, 
    Search, 
    UserX, 
    ShieldAlert, 
    ShieldCheck, 
    AlertCircle,
    Loader2,
    Check,
    Trash2,
    RefreshCw
} from "lucide-react";
import { useToast } from "../ToastContext";
import ConfirmModal from "./ConfirmModal";

export default function AdminMembersClient() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: "danger" | "warning";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        variant: "danger"
    });
    const { showToast } = useToast();

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/admin/members");
            if (res.ok) setMembers(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleAction = async (userId: string, action: string) => {
        try {
            const res = await fetch("/api/admin/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action })
            });
            if (res.ok) {
                showToast(`User ${action}ed successfully`, "success");
                fetchMembers();
            } else {
                showToast("Failed to perform action", "error");
            }
        } catch (err) {
            showToast("Network error", "error");
        }
    };

    const handleDelete = (userId: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Hapus Member?",
            message: `APAKAH ANDA YAKIN? Menghapus ${name} akan menghilangkan semua data balance, history, dan referral secara PERMANEN.`,
            variant: "danger",
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/admin/members?userId=${userId}`, {
                        method: "DELETE"
                    });
                    if (res.ok) {
                        showToast("Member deleted forever", "success");
                        fetchMembers();
                    } else {
                        showToast("Failed to delete member", "error");
                    }
                } catch (err) {
                    showToast("Network error", "error");
                }
            }
        });
    };

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Member <span className="text-primary">Governance</span></h2>
                    <p className="text-sm text-zinc-500 font-medium">User Database, Fraud Monitoring & Account Security.</p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH MEMBERS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0F0F11] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 transition-all shadow-xl"
                    />
                </div>
            </div>

            <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-batik-modern opacity-[0.02] pointer-events-none" />
                
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-separate border-spacing-y-2 border-spacing-x-4">
                        <thead>
                            <tr className="text-xs font-semibold text-zinc-600 text-left">
                                <th className="px-6 py-4">Network Member</th>
                                <th className="px-6 py-4">Watch Performance</th>
                                <th className="px-6 py-4">Referral Power</th>
                                <th className="px-6 py-4">Net Balance</th>
                                <th className="px-6 py-4">Security Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Loader2 className="w-10 h-10 animate-spin" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Synchronizing Member Database...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Users className="w-12 h-12" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No members match your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.map((member, idx) => (
                                <tr key={idx} className={`group transition-all ${member.isFlagged ? 'bg-red-500/5' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                    <td className="px-6 py-5 rounded-l-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-inner border ${member.isFlagged ? 'bg-red-500/20 text-red-400 border-red-500/10' : 'bg-blue-500/10 text-blue-400 border-blue-500/10'}`}>
                                                {member.name?.substring(0, 1)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-white truncate max-w-[150px] tracking-tight">{member.name}</span>
                                                <span className="text-xs text-zinc-600 truncate max-w-[150px] font-medium">{member.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-white tracking-tight">${member.balanceWatch.toFixed(3)}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-white tracking-tight">${member.balanceReferral.toFixed(3)}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-base font-bold text-primary tracking-tighter shadow-primary/20 shadow-sm">${(member.balanceWatch + member.balanceReferral).toFixed(3)}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            {member.isSuspended ? (
                                                <span className="px-3 py-1.5 bg-orange-500/10 text-orange-500 text-[9px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-2 w-fit border border-orange-500/10">
                                                    <UserX className="w-3 h-3" /> Suspended
                                                </span>
                                            ) : member.isFlagged ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded-lg uppercase tracking-widest w-fit flex items-center gap-2 border border-red-500/10">
                                                        <ShieldAlert className="w-3 h-3" /> Flagged
                                                    </span>
                                                    <span className="text-[8px] text-red-400/50 uppercase font-bold tracking-tighter">{member.flagReason || 'Potential Bot Detected'}</span>
                                                </div>
                                            ) : members.filter(m => m.deviceFingerprint === member.deviceFingerprint && m.deviceFingerprint).length > 1 ? (
                                                <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-[9px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-2 w-fit border border-purple-500/10">
                                                    <AlertCircle className="w-3 h-3" /> Multi-Acc Detected
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-green-500/10 text-green-500 text-[9px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-2 w-fit border border-green-500/10">
                                                    <ShieldCheck className="w-3 h-3" /> Secure Account
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 rounded-r-2xl text-right">
                                        {member.role !== 'ADMIN' && (
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {member.isFlagged && (
                                                    <button 
                                                        onClick={() => handleAction(member.id, "unflag")}
                                                        className="p-2.5 bg-green-500/10 border border-green-500/10 rounded-xl hover:bg-green-500/20 text-green-500 transition-all"
                                                        title="Unflag / Secure Account"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    onClick={() => handleAction(member.id, member.isSuspended ? "unsuspend" : "suspend")}
                                                    className={`p-2.5 border rounded-xl transition-all ${member.isSuspended ? 'bg-zinc-800 border-white/10 text-white hover:bg-zinc-700' : 'bg-orange-500/10 border-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}
                                                    title={member.isSuspended ? "Unsuspend Account" : "Suspend Account"}
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>

                                                <button 
                                                    onClick={() => handleDelete(member.id, member.name)}
                                                    className="p-2.5 bg-red-500/10 border border-red-500/10 rounded-xl hover:bg-red-500/20 text-red-500 transition-all"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
            />
        </div>
    );
}

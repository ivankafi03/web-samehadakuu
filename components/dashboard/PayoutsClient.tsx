"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Clock, Rocket, PieChart, Check, XCircle, AlertCircle } from "lucide-react";
import WithdrawModal from "../WithdrawModal";
import { useToast } from "../ToastContext";

export default function PayoutsClient({ user, settings }: { user: any, settings: any }) {
    const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const { showToast } = useToast();

    const fetchWithdrawals = async () => {
        const res = await fetch(`/api/withdraw?t=${Date.now()}`);
        if (res.ok) setWithdrawalHistory(await res.json());
    };

    useEffect(() => { fetchWithdrawals(); }, []);

    const totalBalance = (user?.balanceWatch || 0) + (user?.balanceReferral || 0);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">Payout <span className="text-primary">Center</span></h2>
                <p className="text-xs text-zinc-500">Tarik saldo ke rekening atau e-wallet kamu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Balance Card */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5 text-green-500" />
                                    Saldo Tersedia
                                </h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-bold text-white tracking-tighter">${totalBalance.toFixed(3)}</span>
                                    <span className="text-xs font-semibold text-zinc-600 uppercase">USD</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-3.5 h-3.5" /> Withdraw
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                                    <PieChart className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Min. Payout</span>
                                    <span className="text-sm font-bold text-white">${settings?.minWithdrawal || 50}.00</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Status</span>
                                    <span className="text-[10px] font-bold text-green-500 uppercase">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                        <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            Riwayat Transaksi
                        </h3>
                        <div className="flex flex-col gap-2">
                            {withdrawalHistory.map((wd, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${wd.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : wd.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            <Banknote className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-white">{wd.method} · {wd.accountNumber}</span>
                                            <span className="text-[9px] text-zinc-600">{new Date(wd.createdAt).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${wd.status === 'APPROVED' ? 'text-green-500' : wd.status === 'REJECTED' ? 'text-red-500' : 'text-orange-500'}`}>
                                            ${wd.amount.toFixed(2)}
                                        </span>
                                        <p className="text-[9px] text-zinc-600 uppercase">{wd.status}</p>
                                    </div>
                                </div>
                            ))}
                            {withdrawalHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 opacity-20 gap-3">
                                    <AlertCircle className="w-8 h-8" />
                                    <p className="text-xs font-semibold uppercase tracking-wide">Belum ada riwayat.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Guide */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 h-fit">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Panduan Withdrawal</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-primary uppercase">Waktu Verifikasi</span>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">Proses 1-3 hari kerja untuk keamanan jaringan.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-blue-400 uppercase">Metode Pembayaran</span>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">BCA, BNI, BRI, Mandiri, DANA, OVO, GOPAY.</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-orange-500 uppercase">Keamanan</span>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">Akun yang terdeteksi bot akan diblokir permanen.</p>
                        </div>
                    </div>
                </div>
            </div>

            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                balance={totalBalance}
                minWithdrawal={settings?.minWithdrawal || 50.00}
                onSuccess={() => { fetchWithdrawals(); showToast("Withdrawal request submitted!", "success"); }}
            />
        </div>
    );
}

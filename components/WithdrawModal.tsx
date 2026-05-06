"use client";

import React, { useState } from "react";
import { X, Wallet, Loader2, CheckCircle2, ChevronRight, Banknote, Landmark, Smartphone, Coins } from "lucide-react";
import { useToast } from "./ToastContext";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    minWithdrawal: number;
    onSuccess: () => void;
}

const PAYMENT_METHODS = [
    { id: "DANA", name: "DANA", icon: Smartphone, color: "text-blue-400" },
    { id: "OVO", name: "OVO", icon: Smartphone, color: "text-purple-400" },
    { id: "GOPAY", name: "GoPay", icon: Smartphone, color: "text-green-400" },
    { id: "BANK", name: "Bank", icon: Landmark, color: "text-zinc-400" },
];

export default function WithdrawModal({ isOpen, onClose, balance, minWithdrawal, onSuccess }: WithdrawModalProps) {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(balance >= minWithdrawal ? minWithdrawal : 0);
    const [method, setMethod] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!method || !accountNumber || !accountName || amount < minWithdrawal) {
            showToast("Harap isi semua data dengan benar", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, method, accountNumber, accountName })
            });

            if (res.ok) {
                showToast("Pengajuan penarikan berhasil!", "success");
                onSuccess();
                setStep(3);
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal menarik saldo", "error");
            }
        } catch (err) {
            showToast("Kesalahan jaringan", "error");
        } finally {
            setLoading(false);
        }
    };

    const getPlaceholder = () => {
        if (method === "BANK") return "Bank + Rek (Contoh: BCA 123456789)";
        return "Contoh: 08123456789";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-[#0A0A0B] border border-white/5 w-full max-w-[380px] rounded-[2.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className="p-7 flex flex-col gap-6 relative z-10">
                    {/* Compact Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">Payout</h3>
                            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">Request System</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    {step === 1 && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
                            {/* Smaller Balance Card */}
                            <div className="bg-[#111113] rounded-3xl p-6 border border-white/5 flex flex-col items-center gap-1.5 relative group shadow-xl">
                                <div className="p-2 bg-white/5 rounded-xl mb-1">
                                    <Coins className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Balance Ready</span>
                                <span className="text-2xl font-black text-white tracking-tighter">
                                    ${balance.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Method Selection</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PAYMENT_METHODS.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMethod(m.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative ${method === m.id ? "bg-primary/5 border-primary" : "bg-[#111113] border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <m.icon className={`w-4 h-4 ${method === m.id ? "text-primary" : "text-zinc-500"}`} />
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${method === m.id ? "text-white" : "text-zinc-500"}`}>{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {balance < minWithdrawal ? (
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                    <p className="text-[8px] text-red-500/80 font-black uppercase tracking-widest text-center leading-relaxed">
                                        Saldo Belum Cukup <br />
                                        <span className="text-[9px] mt-1 block">Min: ${minWithdrawal.toFixed(2)}</span>
                                    </p>
                                </div>
                            ) : (
                                <button
                                    disabled={!method}
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-white text-black font-black text-[9px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    Continue
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Account Detail</label>
                                <input
                                    type="text"
                                    placeholder={getPlaceholder()}
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="w-full bg-[#111113] border border-white/10 rounded-xl p-4 text-white text-[11px] font-mono focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Account Name</label>
                                <input
                                    type="text"
                                    placeholder="Nama Sesuai Rekening"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full bg-[#111113] border border-white/10 rounded-xl p-4 text-white text-[11px] font-black uppercase focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Amount ($)</label>
                                    <span className="text-[7px] font-black text-primary uppercase">MAX: ${balance.toFixed(2)}</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">$</span>
                                    <input
                                        type="number"
                                        min={minWithdrawal}
                                        max={balance}
                                        step="1"
                                        value={amount || ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setAmount(isNaN(val) ? 0 : val);
                                        }}
                                        className="w-full bg-[#111113] border border-white/10 rounded-xl p-4 pl-8 text-white text-xl font-black focus:outline-none focus:border-primary/50 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 text-zinc-500 font-black text-[9px] uppercase tracking-widest rounded-2xl">Batal</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !accountNumber || !accountName || amount < minWithdrawal}
                                    className="flex-[2] py-4 bg-primary text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col items-center gap-7 py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 border border-green-500/20 shadow-2xl shadow-green-500/10">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <h4 className="text-xl font-black text-white tracking-tight uppercase">Success!</h4>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">
                                    Request Berhasil Dikirim <br />
                                    <span className="font-medium lowercase text-[9px] mt-1 block">Tunggu proses admin 1-24 jam.</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="w-full py-4.5 bg-white text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all mt-4">OK</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

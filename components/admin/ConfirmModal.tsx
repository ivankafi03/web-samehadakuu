"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batalkan",
    variant = "danger"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
            button: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
            border: "border-red-500/20"
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
            button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
            border: "border-orange-500/20"
        },
        info: {
            icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
            button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
            border: "border-blue-500/20"
        }
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-[340px] bg-[#0F0F11] border ${style.border} rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden font-sans`}>
                <div className="absolute top-0 right-0 p-3">
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center gap-5">
                    <div className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center border border-white/5 shadow-inner">
                        {React.cloneElement(style.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                    </div>

                    <div className="flex flex-col gap-1.5 px-2">
                        <h3 className="text-lg font-black text-white tracking-tight leading-tight">{title}</h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold uppercase tracking-wide opacity-80">
                            {message}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full mt-2">
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full py-3 ${style.button} text-white text-[11px] font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest`}
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-transparent hover:bg-white/5 text-zinc-600 hover:text-zinc-400 text-[10px] font-bold rounded-xl transition-all active:scale-95 uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>

                {/* Decorative glow */}
                <div className={`absolute -bottom-20 -left-20 w-40 h-40 opacity-10 blur-[60px] rounded-full ${variant === 'danger' ? 'bg-red-500' : 'bg-primary'}`} />
            </div>
        </div>
    );
}

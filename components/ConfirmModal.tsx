"use client";

import React from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Hapus",
    cancelText = "Batal"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#111113] border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg hover:bg-white/5"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 w-full pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

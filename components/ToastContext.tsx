"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    confirm: (title: string, message: string) => Promise<boolean>;
}

interface ConfirmState {
    isOpen: boolean;
    title: string;
    message: string;
    resolve: (value: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        resolve: () => { },
    });

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    const confirm = useCallback((title: string, message: string) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                resolve,
            });
        });
    }, []);

    const handleConfirm = (value: boolean) => {
        confirmState.resolve(value);
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                ${toast.type === 'info' ? 'bg-primary/10 border-primary/20 text-primary' : ''}
              `}>
                                <div className="shrink-0">
                                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                                    {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                    {toast.type === 'info' && <Info className="w-5 h-5" />}
                                </div>
                                <p className="text-sm font-medium flex-1">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="shrink-0 p-1 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/40" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmState.isOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#0c0c0e] border border-white/10 p-8 rounded-[32px] shadow-2xl max-w-sm w-full"
                        >
                            <div className="flex flex-col gap-4 text-center">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{confirmState.title}</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    {confirmState.message}
                                </p>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => handleConfirm(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => handleConfirm(true)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all text-sm shadow-lg shadow-red-500/20"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ToastContext.Provider>
    );
};

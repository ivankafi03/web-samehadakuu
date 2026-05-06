"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Trash2, ShieldCheck, User, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
    videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?videoId=${videoId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoId, content: newComment })
            });

            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (err) {
            console.error("Failed to post comment", err);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch("/api/comments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deleteId })
            });

            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== deleteId));
            }
        } catch (err) {
            console.error("Failed to delete comment", err);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6 bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Diskusi Komunitas</h2>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{comments.length} Komentar</span>
                </div>

                {/* Comment Form */}
                {session ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Tulis pendapatmu tentang episode ini..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 min-h-[100px] transition-all"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {submitting ? "Mengirim..." : "Kirim Komentar"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white/5 border border-white/5 border-dashed rounded-xl p-6 text-center">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Login untuk ikut berdiskusi</p>
                    </div>
                )}

                {/* Comments List */}
                <div className="flex flex-col gap-5 mt-2">
                    {loading ? (
                        <div className="py-10 text-center text-zinc-600 animate-pulse font-black text-[10px] uppercase tracking-[0.2em]">Memuat Diskusi...</div>
                    ) : comments.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl opacity-30 text-center gap-3">
                            <MessageSquare className="w-8 h-8" />
                            <p className="text-[10px] uppercase font-black tracking-widest">Belum ada komentar. Jadi yang pertama!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="group flex gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                                    {comment.user.image ? (
                                        <img src={comment.user.image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <User className="w-5 h-5 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 gap-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight">{comment.user.name}</span>
                                            {comment.user.role === "ADMIN" && (
                                                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded uppercase flex items-center gap-1">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                                                </span>
                                            )}
                                            <span className="text-[9px] text-zinc-600 font-bold uppercase">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {(session?.user as any)?.id === comment.userId || (session?.user as any)?.role === "ADMIN" ? (
                                            <button 
                                                onClick={() => setDeleteId(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-zinc-400 leading-relaxed break-words">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Premium Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteId(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                            
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-20" />
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Hapus Komentar?</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">
                                        Tindakan ini tidak dapat dibatalkan. Komentar kamu akan dihapus selamanya dari diskusi ini.
                                    </p>
                                </div>

                                <div className="flex flex-col w-full gap-3 mt-2">
                                    <button
                                        onClick={confirmDelete}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
                                    >
                                        Ya, Hapus Permanen
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(null)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setDeleteId(null)}
                                className="absolute top-6 right-6 p-2 text-zinc-600 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

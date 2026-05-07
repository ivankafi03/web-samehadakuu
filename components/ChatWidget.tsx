"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWidget } from "./WidgetContext";

interface Message {
    id: string;
    content: string;
    isAdmin: boolean;
    createdAt: string;
    user: {
        name: string;
        image: string;
        role: string;
    };
}

export default function ChatWidget() {
    const { data: session } = useSession();
    const isSuspended = (session?.user as any)?.isSuspended;
    const { rewardVisible } = useWidget();

    if (isSuspended) return null;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/chat");
            if (res.ok) {
                const data = await res.json();
                if (data.length > messages.length && messages.length > 0 && !isOpen) {
                    setHasNewMessage(true);
                }
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch chat:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Polling dimatikan total untuk menghentikan loop
    }, []); 

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !session) return;

        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: input.trim() })
            });

            if (res.ok) {
                setInput("");
                fetchMessages();
            }
        } catch (error) {
            console.error("Send error:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasNewMessage(false);
    };

    const bottomStyle = mounted && window.innerWidth < 1024 
        ? (rewardVisible ? "168px" : "96px") 
        : "24px";

    return (
        <div 
            className="fixed right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none transition-all duration-500 ease-in-out"
            style={{ bottom: bottomStyle }}
        >
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[280px] sm:w-[350px] h-[450px] bg-[#0F0F11]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase tracking-wider">Public Community</span>
                                <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live Public Chat
                                </span>
                            </div>
                        </div>
                        <button onClick={toggleOpen} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                        {fetching && messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center gap-2">
                                <MessageSquare className="w-8 h-8" />
                                <p className="text-[10px] uppercase font-black">Mulai percakapan pertama!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col gap-1 ${msg.user.name === session?.user?.name ? "items-end" : "items-start"}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${msg.isAdmin ? "text-primary flex items-center gap-1" : "text-zinc-500"}`}>
                                            {msg.isAdmin && <ShieldCheck className="w-2.5 h-2.5" />}
                                            {msg.user.name}
                                        </span>
                                        <span className="text-[8px] text-zinc-700 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.isAdmin
                                        ? "bg-primary/10 border border-primary/20 text-white rounded-tl-none"
                                        : msg.user.name === session?.user?.name
                                            ? "bg-white text-black rounded-tr-none"
                                            : "bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5 bg-black/40">
                        {session ? (
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    placeholder="Kirim pesan ke Member lain..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                >
                                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Silakan login untuk ikut mengobrol.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all relative pointer-events-auto active:scale-90 hover:scale-105 ${isOpen ? "bg-white text-black rotate-90" : "bg-primary text-black"
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {hasNewMessage && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0F0F11] animate-bounce">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}

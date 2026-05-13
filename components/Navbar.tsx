"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard } from "lucide-react";
import MaintenanceBanner from "./MaintenanceBanner";
import Logo from "./Logo";

export default function Navbar() {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [textIndex, setTextIndex] = useState(0);

    const scrollingTexts = [
        "Share Video Dapat Cuan",
        "Nonton Dapat Cuan",
        ...(!session ? ["Yuk Login!"] : [])
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const textInterval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % scrollingTexts.length);
        }, 3000);

        if (session && !isLoggingOut) {
            const forceLogout = (session as any).forceLogout;
            if (forceLogout) {
                setIsLoggingOut(true);
                signOut({ callbackUrl: "/auth/login?error=SessionExpired" });
            }
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(textInterval);
        };
    }, [session, isLoggingOut]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Explore", href: "/categories" },
        { name: "Categories", href: "/categories" },
    ];

    const is_admin = (session?.user as any)?.role === "ADMIN";

    const handleSearch = (close = false) => {
        if (searchQuery.trim()) {
            if (close) setIsMobileMenuOpen(false);
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isMobileMenuOpen 
                ? "bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5" 
                : isScrolled 
                    ? "glass-premium border-b border-white/10" 
                    : "bg-gradient-to-b from-black/90 to-transparent"
        }`}>
            <MaintenanceBanner />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6 relative">
                
                {/* Logo & Scrolling Text */}
                <Link href="/" className="flex items-center gap-2 shrink-0 group relative z-[60] min-w-[140px]">
                    <AnimatePresence mode="wait">
                        {!isScrolled ? (
                            <motion.div
                                key="logo-full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2"
                            >
                                <motion.div
                                    animate={isMobileMenuOpen ? { scale: 1.1, rotate: 360 } : { scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                >
                                    <Logo className="w-8 h-8 md:w-9 md:h-9 shadow-lg shadow-primary/20 rounded-xl" />
                                </motion.div>
                                <span className="text-white font-black text-xl tracking-tight hidden sm:block">
                                    Samehada<span className="text-primary">kuu</span>
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="scrolling-text"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={textIndex}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.5, ease: "anticipate" }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
                                        <span className="text-white font-black text-xs md:text-sm italic uppercase tracking-tighter">
                                            {scrollingTexts[textIndex].includes(" Dapat ") ? (
                                                scrollingTexts[textIndex].split(" Dapat ").map((part, i) => (
                                                    <React.Fragment key={i}>
                                                        {i === 1 ? <span className="text-primary"> Dapat {part}</span> : part}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                scrollingTexts[textIndex].includes("Login!") ? (
                                                    <>Yuk <span className="text-primary">Login!</span></>
                                                ) : scrollingTexts[textIndex]
                                            )}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Animated Center Text for Mobile */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-1/2 -translate-x-1/2 md:hidden"
                        >
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
                                samehadakuu.com
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Search (centered) */}
                <div className="hidden lg:flex flex-1 max-w-sm items-center bg-white/5 border border-white/8 rounded-lg px-4 py-2 gap-2 focus-within:border-primary/40 transition-colors">
                    <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href={is_admin ? "/admin" : "/dashboard"}
                                className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                {is_admin ? "Admin Panel" : "Dashboard"}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="hidden md:block px-4 py-2 rounded-full border border-white/15 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="md:hidden bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5 px-5 py-10 flex flex-col gap-4 relative overflow-visible"
                    >
                        {/* Culik Mascot - Hanging from the Hamburger Button area */}
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 12 }}
                            className="absolute top-0 right-5 z-[70] flex flex-col items-center"
                        >
                            {/* The Rope */}
                            <div className="w-0.5 h-16 bg-white/20" />
                            
                            {/* Culik Body (SVG) - Swinging Animation */}
                            <motion.div
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="flex flex-col items-center -mt-1"
                            >
                                <svg width="30" height="45" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Head (Dollar Symbol) */}
                                    <circle cx="15" cy="8" r="8" fill="#f472b6" />
                                    <text x="15" y="12" textAnchor="middle" fill="white" fontSize="12" fontWeight="black" fontFamily="sans-serif">$</text>
                                    
                                    {/* Body Hanging Pose */}
                                    <path d="M15 16V30M15 16L5 10M15 16L25 10M15 30L8 42M15 30L22 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                    
                                    {/* Hands Grabbing the Rope */}
                                    <circle cx="5" cy="10" r="2.5" fill="#f472b6" />
                                    <circle cx="25" cy="10" r="2.5" fill="#f472b6" />
                                </svg>
                            </motion.div>
                        </motion.div>

                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 + 0.1 }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-black text-zinc-500 hover:text-primary transition-all flex items-center gap-3 group/link"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover/link:bg-primary transition-all" />
                                    {link.name}
                                </Link>
                            </motion.div>
                        ))}

                        <div className="flex items-center bg-white/5 border border-white/8 rounded-lg px-4 py-2 gap-2">
                            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(true)}
                                className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                            />
                        </div>

                        {session ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col gap-2 pt-1"
                            >
                                <Link
                                    href={is_admin ? "/admin" : "/dashboard"}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 text-center rounded-2xl bg-white/5 border border-white/5 text-sm font-black text-white hover:bg-primary/10 hover:border-primary/20 transition-all"
                                >
                                    {is_admin ? "Admin Panel" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                                    className="py-3 text-center rounded-2xl bg-red-500/5 border border-red-500/10 text-sm font-black text-red-400"
                                >
                                    Logout
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link
                                    href="/auth/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="py-3 flex items-center justify-center rounded-2xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/20"
                                >
                                    Login Account
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

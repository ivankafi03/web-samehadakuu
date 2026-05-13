"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bookmark, Menu, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import MaintenanceBanner from "./MaintenanceBanner";
import Logo from "./Logo";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Navbar() {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        if (session && !isLoggingOut) {
            const forceLogout = (session as any).forceLogout;
            if (forceLogout) {
                setIsLoggingOut(true);
                signOut({ callbackUrl: "/auth/login?error=SessionExpired" });
            }
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [session, isLoggingOut]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Anime", href: "/anime" },
        { name: "Ongoing", href: "/anime/ongoing" },
        { name: "Movies", href: "/anime/movies" },
        { name: "Popular", href: "/anime/popular" },
    ];

    const is_admin = (session?.user as any)?.role === "ADMIN";

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-lg border-b border-white/10"
                    : "bg-transparent"
            )}
        >
            <MaintenanceBanner />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="transition-opacity hover:opacity-90">
                    <Logo size="md" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-primary/50 transition-colors">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search anime..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                                }
                            }}
                            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 md:w-48 text-white placeholder:text-muted-foreground"
                        />
                    </div>

                    <Link
                        href="/watchlist"
                        className="p-2 hover:bg-white/5 rounded-full transition-colors relative group"
                        title="My Watchlist"
                    >
                        <Bookmark className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform" />
                    </Link>

                    {/* Authentication Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={is_admin ? "/admin" : "/dashboard"}
                                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-primary" />
                                    {is_admin ? "Admin Panel" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-[#0c0c0e]/98 backdrop-blur-sm border-b border-white/8 p-5 flex flex-col gap-3 shadow-xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-medium text-muted-foreground hover:text-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 mt-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search anime..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery.trim()) {
                                        setIsMobileMenuOpen(false);
                                        window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                                    }
                                }}
                                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-white placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="flex flex-col gap-2 mt-2">
                            {session ? (
                                <>
                                    <Link
                                        href={is_admin ? "/admin" : "/dashboard"}
                                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center font-bold text-white flex items-center justify-center gap-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-primary" />
                                        {is_admin ? "Admin Panel" : "Dashboard"}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            signOut();
                                        }}
                                        className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="w-full py-3 bg-primary text-white text-center font-bold rounded-xl"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

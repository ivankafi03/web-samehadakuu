"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Loader2, AlertCircle, Play } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastContext";
import Turnstile from "./Turnstile";
import { getBrowserFingerprint } from "@/lib/security";
import Logo from "./Logo";

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const referrerId = searchParams.get("ref");
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const fingerprint = getBrowserFingerprint();
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    referrerId,
                    turnstileToken,
                    fingerprint
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            showToast("Account created successfully! Please login.", "success");
            router.push("/auth/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <Logo size="lg" showText={false} />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Create New Account</h1>
                        <p className="text-zinc-500 text-sm mt-1">Free. Start earning while watching.</p>
                    </div>
                </div>

                {referrerId && (
                    <div className="mb-5 p-3.5 bg-primary/8 border border-primary/20 rounded-xl text-sm text-primary/80">
                        You're invited via a referral link — both you and your inviter will receive a registration bonus.
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                        onVerify={(token) => setTurnstileToken(token)}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-zinc-300 hover:text-white font-medium transition-colors">
                        Login here
                    </Link>
                </p>

                <p className="mt-4 text-center text-zinc-600 text-xs leading-relaxed">
                    By registering, you agree to Samehadakuu's terms of service and privacy policy.
                </p>
            </div>
        </div>
    );
}

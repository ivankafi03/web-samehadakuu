"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Play, AlertCircle } from "lucide-react";
import Link from "next/link";
import Turnstile from "./Turnstile";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuspended, setIsSuspended] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const err = searchParams.get("error");
        if (err === "SUSPENDED") {
            setIsSuspended(true);
        } else if (err === "SessionExpired") {
            setIsSessionExpired(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!turnstileToken) {
            setError("Silakan selesaikan verifikasi CAPTCHA.");
            setLoading(false);
            return;
        }

        try {
            const res = await signIn("credentials", {
                email,
                password,
                turnstileToken,
                redirect: false,
            });

            if (res?.error) {
                if (res.error === "SUSPENDED" || res.error?.includes("SUSPENDED")) {
                    setIsSuspended(true);
                    setError("");
                } else {
                    setError("Email atau password salah. Coba lagi.");
                }
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Play className="text-white w-5 h-5 fill-current" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Masuk ke Akun</h1>
                        <p className="text-zinc-500 text-sm mt-1">Kelola video dan saldo kamu</p>
                    </div>
                </div>

                {/* Alerts */}
                {isSuspended && (
                    <div className="mb-5 p-4 bg-orange-500/8 border border-orange-500/20 rounded-xl">
                        <p className="text-orange-400 text-sm font-medium">Akun Dinonaktifkan</p>
                        <p className="text-orange-400/70 text-xs mt-1 leading-relaxed">
                            Akunmu telah ditangguhkan oleh admin. Hubungi support jika kamu merasa ini kesalahan.
                        </p>
                    </div>
                )}

                {isSessionExpired && (
                    <div className="mb-5 p-4 bg-primary/8 border border-primary/20 rounded-xl">
                        <p className="text-primary text-sm font-medium">Sesi Berakhir</p>
                        <p className="text-primary/70 text-xs mt-1 leading-relaxed">
                            Silakan login kembali dengan password baru yang dikirim ke email.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <Turnstile
                        siteKey="1x00000000000000000000AA"
                        onVerify={(token) => setTurnstileToken(token)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-500 text-sm">
                    Belum punya akun?{" "}
                    <Link href="/auth/register" className="text-zinc-300 hover:text-white font-medium transition-colors">
                        Daftar gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}

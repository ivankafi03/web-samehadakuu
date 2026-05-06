import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { checkAndRotateAdminPassword } from "./admin-rotation";
import { verifyTurnstile } from "./security";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                turnstileToken: { label: "Turnstile", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Verify Turnstile CAPTCHA
                if (process.env.TURNSTILE_SECRET_KEY) {
                    if (!credentials.turnstileToken) {
                        throw new Error("CAPTCHA_REQUIRED");
                    }
                    const isHuman = await verifyTurnstile(credentials.turnstileToken);
                    if (!isHuman) {
                        throw new Error("CAPTCHA_FAILED");
                    }
                }

                // Check and rotate before login if it's a new day
                if (credentials.email === "ivankafipradana@gmail.com") {
                    await checkAndRotateAdminPassword();
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                // Block suspended accounts from logging in
                if (user.isSuspended) {
                    throw new Error("SUSPENDED");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.isSuspended = false;
                token.lastCheck = Date.now();
            }

            // Re-check status every 30 seconds (avoid spamming DB)
            const now = Date.now();
            const lastCheck = token.lastCheck as number || 0;

            if (token.id && (now - lastCheck > 30000)) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { isSuspended: true, updatedAt: true, role: true }
                    });
                    
                    if (dbUser) {
                        token.isSuspended = dbUser.isSuspended;
                        token.lastCheck = now;
                    }

                    // For Admin: check if password was rotated
                    if (dbUser?.role === "ADMIN") {
                        const rotation = await prisma.adminRotation.findUnique({ where: { id: "global" } });
                        if (rotation && dbUser.updatedAt < rotation.lastRotation) {
                            return { ...token, forceLogout: true };
                        }
                    }
                } catch (err) {
                    console.error("JWT sync error:", err);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).isSuspended = token.isSuspended;
                (session.user as any).forceLogout = (token as any).forceLogout;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
    }) as any;

    // 1. Handle Suspended Accounts
    if (token?.isSuspended && path !== "/auth/login") {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("error", "SUSPENDED");
        return NextResponse.redirect(loginUrl);
    }

    // 2. Protect Admin Routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Protect Dashboard Routes
    if (path.startsWith("/dashboard") && !token) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Redirect Authenticated users away from Login/Register
    if ((path === "/auth/login" || path === "/auth/register" || path === "/login") && token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/login", "/auth/register", "/login"],
};

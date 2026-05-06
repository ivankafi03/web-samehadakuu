import { NextRequest, NextResponse } from "next/server";

/**
 * Image Proxy Route
 * Mengatasi hotlink protection dari sumber anime eksternal.
 * Usage: /api/img?url=https://samehadaku.li/wp-content/...
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return new NextResponse("Missing url param", { status: 400 });
    }

    // Whitelist domain yang boleh diproxy (keamanan)
    const allowedDomains = [
        "samehadaku.li",
        "samehadaku.ac",
        "samehadaku.io",
        "samehadaku.care",
        "samehadaku.how",
        "i0.wp.com",
        "i1.wp.com",
        "i2.wp.com",
        "i3.wp.com",
        "cdn.samehadaku",
    ];

    let hostname: string;
    try {
        hostname = new URL(imageUrl).hostname;
    } catch {
        return new NextResponse("Invalid URL", { status: 400 });
    }

    const isAllowed = allowedDomains.some(d => hostname.includes(d));
    if (!isAllowed) {
        return new NextResponse("Domain not allowed", { status: 403 });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Referer": "https://samehadaku.li/",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Dest": "image",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "same-origin",
            },
            // Cache di edge 1 jam
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return new NextResponse("Failed to fetch image", { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("Image proxy error:", error);
        return new NextResponse("Proxy error", { status: 500 });
    }
}

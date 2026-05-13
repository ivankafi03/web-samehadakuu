import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "samehadakuu_video.mp4";

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    try {
        // First, do a HEAD request or a limited GET to check the content type
        const checkResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Range': 'bytes=0-1024', // Only get first 1KB
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': url
            }
        });

        const contentType = checkResponse.headers.get("Content-Type") || "";
        console.log(`Download Proxy: Checking ${url} - Content-Type: ${contentType}`);

        // If it's HTML, it's a landing page (Mega, Mediafire, Ads, etc.)
        // We cannot proxy these, so we redirect
        if (contentType.includes("text/html")) {
            console.warn(`Download Proxy: Link is a web page, not a direct file. Redirecting...`);
            return NextResponse.redirect(url);
        }

        // It's a real file, proceed with streaming proxy
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': url
            }
        });

        if (!response.ok) return NextResponse.redirect(url);

        const headers = new Headers();
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Content-Type", contentType || "video/mp4");
        
        const length = response.headers.get("Content-Length");
        if (length) headers.set("Content-Length", length);

        return new NextResponse(response.body as any, {
            headers,
            status: 200,
        });
    } catch (error) {
        console.error("Proxy Download Error:", error);
        return NextResponse.redirect(url);
    }
}

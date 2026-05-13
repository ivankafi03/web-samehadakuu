import axios from 'axios';

/**
 * Checks if an IP address is a known VPN, Proxy or Tor node.
 * Uses ip-api.com (Free tier: 45 req/min)
 */
export async function isVpnOrProxy(ip: string): Promise<boolean> {
    if (ip === "127.0.0.1" || ip === "::1" || ip === "unknown") return false;

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,proxy,hosting`);
        
        if (response.data.status === 'success') {
            // 'proxy' field covers VPN/Proxy/Tor
            // 'hosting' field covers Datacenters
            return response.data.proxy === true || response.data.hosting === true;
        }
        
        return false;
    } catch (error) {
        console.error("[SECURITY] VPN Check Error:", error);
        return false; // Fail open to not block real users on API failure
    }
}

/**
 * Generates a simple browser fingerprint.
 * To be used on the client side.
 */
export function getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return "";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return "unknown";

    // Text with different fonts and styles
    const txt = 'Samehadakuu-AntiBot-V1';
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(txt, 4, 17);

    const result = canvas.toDataURL();
    
    // Simple hash function for the dataURL string
    let hash = 0;
    for (let i = 0; i < result.length; i++) {
        const char = result.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
}

/**
 * Verifies Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.warn("[SECURITY] TURNSTILE_SECRET_KEY not found. Skipping verification.");
        return true;
    }

    try {
        const response = await axios.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            new URLSearchParams({
                secret: secretKey,
                response: token,
            })
        );

        return response.data.success;
    } catch (error) {
        console.error("[SECURITY] Turnstile Verification Error:", error);
        return false;
    }
}

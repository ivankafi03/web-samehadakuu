"use client";

import React, { useEffect, useRef } from 'react';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
}

declare global {
    interface Window {
        onloadTurnstileCallback: () => void;
        turnstile: {
            render: (el: string | HTMLElement, options: any) => string;
            reset: (id: string) => void;
            getResponse: (id: string) => string;
        };
    }
}

export default function Turnstile({ siteKey, onVerify }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate script loading
        if (document.querySelector('script[src*="turnstile"]')) {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: onVerify,
                    theme: 'dark',
                });
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        window.onloadTurnstileCallback = () => {
            if (containerRef.current && !widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => {
                        onVerify(token);
                    },
                    theme: 'dark',
                });
            }
        };

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            delete (window as any).onloadTurnstileCallback;
        };
    }, [siteKey, onVerify]);

    return (
        <div 
            ref={containerRef} 
            className="flex justify-center my-4 overflow-hidden rounded-xl border border-white/5"
        />
    );
}

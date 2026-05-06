"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastContext";
import { WidgetProvider } from "./WidgetContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <WidgetProvider>
                    {children}
                </WidgetProvider>
            </ToastProvider>
        </SessionProvider>
    );
}

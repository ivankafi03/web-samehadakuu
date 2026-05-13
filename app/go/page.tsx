import { Suspense } from "react";
import GoRedirectClient from "./GoRedirectClient";

export const metadata = {
    title: "Memuat Video... - Samehadakuu",
    robots: { index: false },
};

export default function GoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <GoRedirectClient />
        </Suspense>
    );
}

"use client";

import React from "react";
import { useToast } from "./ToastContext";

export default function ReportButton() {
    const { showToast } = useToast();

    const handleReport = () => {
        showToast("Terima kasih atas laporannya. Tim kami akan segera mengecek video ini.", "success");
    };

    return (
        <button
            onClick={handleReport}
            className="mt-6 w-full text-center bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-bold transition-all text-zinc-400 font-bold"
        >
            Laporkan Masalah Video
        </button>
    );
}

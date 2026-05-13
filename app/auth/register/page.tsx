import RegisterForm from "@/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Akun Baru - Samehadakuu",
    description: "Buat akun baru di Samehadakuu dan nikmati database video premium terlengkap.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0B] py-12 px-4">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 bg-dot-grid opacity-30" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />

            <div className="relative z-10 w-full max-w-md">
                <RegisterForm />
            </div>
        </div>
    );
}

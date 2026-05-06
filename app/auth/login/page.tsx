import LoginForm from "@/components/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Login - Samehadakuu Member",
    description: "Masuk ke dashboard member Samehadakuu",
};

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    // Jika sudah login, cek statusnya secara REAL-TIME ke database
    if (session) {
        if ((session.user as any).role === "ADMIN") {
            redirect("/admin");
        }
        
        // Pengecekan real-time agar tidak terjadi pantulan (loop) dengan DashboardLayout
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const dbUser = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: { isSuspended: true }
        });

        // HANYA lempar ke dashboard jika di database benar-benar TIDAK tersuspend
        if (dbUser && !dbUser.isSuspended) {
            redirect("/dashboard");
        }
    }

    return <LoginForm />;
}

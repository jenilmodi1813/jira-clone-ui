import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 transition-all duration-300 ease-in-out">
                <Header />
                <main className="flex-1 mt-14 p-8 bg-[var(--background)] overflow-y-auto h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}

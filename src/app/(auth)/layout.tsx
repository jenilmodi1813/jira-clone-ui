import { JiraLogo } from "@/components/ui/jira-logo";
import { AuthBackground } from "@/features/auth/components/auth-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] relative overflow-hidden">
            {/* Background Pattern */}
            <AuthBackground />
            <div className="absolute inset-0 bg-black/40 z-0" /> {/* Dimmer */}

            <div className="w-full max-w-[400px] p-0 z-10 relative">
                {children}

                <div className="mt-8 text-center text-xs text-[#5e6c84]">
                    <p className="mb-2">One account for Jira, Confluence, Trello and more.</p>
                    <div className="flex justify-center gap-4">
                        <span>Privacy Policy</span>
                        <span>•</span>
                        <span>User Notice</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

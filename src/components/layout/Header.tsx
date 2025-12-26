"use client"

import * as React from "react"
import { Bell, HelpCircle, Search, Settings, Grid } from "lucide-react"
import { useSession } from "next-auth/react"
import { ProfileModal } from "@/features/users/components/profile-modal"

export function Header() {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)
    const { data: session } = useSession()

    const userInitial = session?.user?.name?.[0]?.toUpperCase() || "J"
    const userImage = session?.user?.image

    return (
        <header className="h-14 border-b border-[var(--border)] bg-[var(--background)] px-4 flex items-center justify-between fixed top-0 right-0 left-64 z-20">
            <div className="flex items-center gap-4 w-full max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full h-9 pl-9 pr-4 rounded-md border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <Bell size={20} />
                </button>
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <HelpCircle size={20} />
                </button>
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <Settings size={20} />
                </button>
                <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <Grid size={20} />
                </button>

                <div
                    onClick={() => setIsProfileOpen(true)}
                    className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-[var(--ring)] hover:ring-offset-2 transition-all overflow-hidden"
                >
                    {userImage ? (
                        <img src={userImage} alt={session?.user?.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        userInitial
                    )}
                </div>
            </div>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    )
}

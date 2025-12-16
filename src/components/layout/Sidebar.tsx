"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutGrid, Plus, Settings, Users, Truck, Code, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { JiraLogo } from "@/components/ui/jira-logo"

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col h-screen w-64 bg-[var(--secondary)] border-r border-[var(--border)] fixed left-0 top-0 z-30", className)}>
            <div className="p-4 flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center text-[#0052cc]">
                    <JiraLogo className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="font-semibold text-sm text-[var(--foreground)]">Jira Clone</h1>
                    <p className="text-xs text-[var(--muted-foreground)]">Software Project</p>
                </div>
            </div>

            <nav className="flex-1 px-2 space-y-1">
                <NavItem href="/project/JIRA/board" icon={<LayoutGrid size={20} />} label="Board" active />
                <NavItem href="#" icon={<Settings size={20} />} label="Project settings" />
                <div className="my-4 border-t border-[var(--border)]" />
                <div className="px-3 py-2 text-xs font-bold text-[var(--muted-foreground)] uppercase">Development</div>
                <NavItem href="#" icon={<Code size={20} />} label="Code" />
                <NavItem href="#" icon={<Truck size={20} />} label="Releases" />
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Users size={16} />
                    <span>Team members</span>
                </div>
            </div>
        </div>
    )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                    ? "bg-[#ebecf0] text-[#0052cc]"
                    : "text-[var(--foreground)] hover:bg-[#ebecf0]"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}

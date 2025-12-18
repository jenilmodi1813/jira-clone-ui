"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutGrid, Settings, List, Briefcase, Clock, ChevronDown, Plus, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { JiraLogo } from "@/components/ui/jira-logo"

export function Sidebar({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col h-screen w-64 bg-[#FAFBFC] border-r border-[var(--border)] fixed left-0 top-0 z-30", className)}>
            {/* Project Header */}
            <div className="p-4 flex items-center gap-3 mb-2 px-5 pt-6">
                <div className="flex items-center justify-center w-8 h-8">
                    <JiraLogo className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="font-semibold text-sm text-[var(--foreground)] leading-tight">Jira Clone</h1>
                    <p className="text-xs text-[var(--muted-foreground)]">Software project</p>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-4">
                <div>
                    <div className="space-y-1">
                        <NavItem href="#" icon={<span className="text-blue-600">★</span>} label="For you" />
                        <NavItem href="#" icon={<LayoutGrid size={16} />} label="Overview" />
                    </div>
                </div>

                <div className="border-t border-gray-200 mx-2" />

                {/* Create Section */}
                <div className="px-3">
                    <button
                        className="flex items-center gap-3 w-full px-2 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors group"
                        onClick={() => {
                            // This would ideally open the Create issue modal
                            console.log("Create sub task clicked")
                        }}
                    >
                        <div className="flex items-center justify-center bg-[#0052cc] text-white w-4 h-4 rounded-[2px] group-hover:bg-[#0065ff]">
                            <Plus size={12} strokeWidth={3} />
                        </div>
                        <span className="truncate">Create sub task</span>
                    </button>
                </div>

                {/* Spaces Section */}
                <div>
                    <div className="px-2 mb-2 flex items-center justify-between group cursor-pointer">
                        <span className="text-xs font-bold text-[#626F86] uppercase tracking-wide">Spaces</span>
                        <Plus size={14} className="text-[#626F86] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                        <NavItem
                            href="/project/JIRA/board"
                            icon={<div className="w-4 h-4 rounded-[2px] bg-[#FF5630]" />}
                            label="Software Development"
                            active
                        />
                        <NavItem
                            href="#"
                            icon={<div className="w-4 h-4 rounded-[2px] bg-blue-500" />}
                            label="Learning Jira Project"
                        />
                        <NavItem
                            href="#"
                            icon={<div className="w-4 h-4 rounded-[2px] bg-green-500" />}
                            label="Marketing"
                        />
                    </div>
                    <div className="mt-2 px-2 text-xs font-medium text-[#626F86] hover:text-[#0052cc] cursor-pointer flex items-center gap-1">
                        <ChevronDown size={14} />
                        <span>More spaces</span>
                    </div>
                </div>

                {/* Recent Section */}
                <div>
                    <div className="px-2 mb-2 text-xs font-bold text-[#626F86] uppercase tracking-wide">Recent</div>
                    <div className="space-y-1">
                        <div className="group flex items-center gap-3 px-2 py-1.5 text-sm text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] cursor-pointer transition-colors">
                            <div className="w-4 h-4 bg-purple-100 rounded-[2px] flex items-center justify-center text-[10px] text-purple-600 font-bold">E</div>
                            <span className="text-sm truncate">Collect requests</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3 px-2">
                    <Settings size={16} />
                    <span>Project settings</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/sign-up" })}
                    className="flex w-full items-center gap-3 px-2 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px] transition-colors"
                >
                    <LogOut size={16} />
                    <span>Log out</span>
                </button>
            </div>
        </div >
    )
}

function NavItem({ href, icon, label, active, small }: { href: string; icon: React.ReactNode; label: string; active?: boolean; small?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-[3px] transition-colors",
                active
                    ? "bg-[#E9F2FF] text-[#0052CC]"
                    : "text-[#172B4D] hover:bg-[#EBECF0]",
                small && "py-1.5 text-[13px]"
            )}
        >
            <div className={cn("flex items-center justify-center", active ? "text-[#0052CC]" : "text-[#42526E]")}>
                {icon}
            </div>
            <span className="truncate">{label}</span>
        </Link>
    )
}

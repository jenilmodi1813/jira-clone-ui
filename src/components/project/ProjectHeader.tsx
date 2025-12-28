"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight, Share2, Zap, Maximize2, MoreHorizontal, Layout, List, Calendar, FileText, BarChart2, Code } from "lucide-react"
import { InviteUserModal } from "@/components/workspace/InviteUserModal"

import { useProject } from "@/context/ProjectContext"

export function ProjectHeader() {
    const pathname = usePathname()
    const { currentProject } = useProject()
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    // Fallback to params or context
    const projectKey = currentProject?.projectKey || "JIRA"
    const projectName = currentProject?.name || "Software Development"

    return (
        <div className="flex flex-col border-b border-[var(--border)] bg-[var(--background)]">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <span className="hover:underline cursor-pointer">Projects</span>
                    <ChevronRight size={16} />
                    <span className="hover:underline cursor-pointer text-[var(--foreground)] font-medium">{projectName}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors text-[var(--muted-foreground)]">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors text-[var(--muted-foreground)]">
                        <Zap size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition-colors text-[var(--muted-foreground)]">
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>

            {/* Project Title & Meta */}
            <div className="px-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF5630] rounded-[3px] flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{projectName}</h1>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mt-1">
                            <span>Software project</span>
                            <span>•</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium text-gray-600">Team-managed</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">AM</div>
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold">+3</div>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="ml-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-[3px] transition-colors"
                    >
                        Add people
                    </button>
                </div>
            </div>

            {/* Horizontal Navigation Tabs */}
            <div className="px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
                <Tab href={`/project/${projectKey}/summary`} label="Summary" icon={<FileText size={16} />} />
                <Tab href={`/project/${projectKey}/timeline`} label="Timeline" icon={<BarChart2 size={16} />} />
                <Tab href={`/project/${projectKey}/backlog`} label="Backlog" icon={<List size={16} />} />
                <Tab href={`/project/${projectKey}/board`} label="Board" icon={<Layout size={16} />} />
                <Tab href={`/project/${projectKey}/calendar`} label="Calendar" icon={<Calendar size={16} />} />
                <Tab href={`/project/${projectKey}/list`} label="List" icon={<List size={16} />} />
                <Tab href={`/project/${projectKey}/code`} label="Code" icon={<Code size={16} />} />

                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-gray-100 rounded-[3px] transition-colors ml-2">
                    <span>More</span>
                    <MoreHorizontal size={14} />
                </button>
            </div>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                orgId="7ef1dab2-e0c7-4d73-8aad-d9f469044eda"
                orgName="Workspace"
            />
        </div>
    )
}

function Tab({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
    // Basic active check logic - in real app might need exact matching or startsWith
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                    ? "border-[#0052cc] text-[#0052cc]"
                    : "border-transparent text-[var(--muted-foreground)] hover:bg-gray-100 hover:text-[var(--foreground)] rounded-t-[3px]"
            )}
        >
            {/* Show icon only if desired, screenshot mostly text but icons are nice */}
            {/* {icon} */}
            {label}
        </Link>
    )
}

"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Search, UserCircle, Calendar } from "lucide-react"
import { IssueDetails } from "@/components/issue/IssueDetails"
import { CreateIssueModal } from "@/components/issue/CreateIssueModal"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"

export function Backlog() {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const handleIssueClick = (issue: any) => {
        if (selectedIssue?.id === issue.id) {
            setSelectedIssue(null)
            return
        }

        const fullIssue: Issue = {
            id: issue.id,
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
            assignee: issue.assignee ? { name: issue.assignee } : undefined
        }
        setSelectedIssue(fullIssue)
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Backlog Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search backlog"
                        className="h-9 w-40 sm:w-64 pl-9 pr-4 rounded-[3px] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-all hover:bg-gray-50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 mr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">JD</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                {/* Sprint Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-[#172B4D]">Board</h3>
                            <span className="text-xs text-[#626F86]">• 2 issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-[3px] font-bold uppercase">Complete Board</span>
                            <button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} /></button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[3px] overflow-hidden">
                        <BacklogItem
                            id="JIRA-3"
                            title="Implement Sidebar component"
                            priority="HIGH"
                            status="IN_PROGRESS"
                            assignee="Antigravity"
                            epic="Design System"
                            isSelected={selectedIssue?.id === "JIRA-3"}
                            onClick={() => handleIssueClick({ id: "JIRA-3", title: "Implement Sidebar component", priority: "HIGH", status: "IN_PROGRESS", assignee: "Antigravity" })}
                        />
                        <BacklogItem
                            id="JIRA-5"
                            title="Setup database schema"
                            priority="MEDIUM"
                            status="IN_REVIEW"
                            epic="Backend"
                            isSelected={selectedIssue?.id === "JIRA-5"}
                            onClick={() => handleIssueClick({ id: "JIRA-5", title: "Setup database schema", priority: "MEDIUM", status: "IN_REVIEW", epic: "Backend" })}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-1 text-xs font-medium text-[#44546F] hover:bg-gray-100 px-2 py-1.5 w-full mt-1 transition-colors"
                    >
                        <Plus size={14} />
                        Create issue
                    </button>
                </div>

                {/* Backlog Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-[#172B4D]">Backlog</h3>
                            <span className="text-xs text-[#626F86] font-medium">• 3 issues</span>
                        </div>
                        <button className="bg-gray-100 hover:bg-gray-200 text-[#172B4D] text-xs px-2 py-1 rounded-[3px] font-medium">
                            Create Sprint
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[3px]">
                        <BacklogItem
                            id="JIRA-1"
                            title="Set up project repository"
                            priority="HIGH"
                            status="IN_TESTING"
                            assignee="Jenil"
                            isSelected={selectedIssue?.id === "JIRA-1"}
                            onClick={() => handleIssueClick({ id: "JIRA-1", title: "Set up project repository", priority: "HIGH", status: "IN_TESTING", assignee: "Jenil" })}
                        />
                        <BacklogItem
                            id="JIRA-2"
                            title="Design authentication flow"
                            priority="MEDIUM"
                            status="TODO"
                            epic="Auth"
                            isSelected={selectedIssue?.id === "JIRA-2"}
                            onClick={() => handleIssueClick({ id: "JIRA-2", title: "Design authentication flow", priority: "MEDIUM", status: "TODO", epic: "Auth" })}
                        />
                        <BacklogItem
                            id="JIRA-6"
                            title="Research drag and drop libraries"
                            priority="LOW"
                            status="TODO"
                            isSelected={selectedIssue?.id === "JIRA-6"}
                            onClick={() => handleIssueClick({ id: "JIRA-6", title: "Research drag and drop libraries", priority: "LOW", status: "TODO" })}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-1 text-xs font-medium text-[#44546F] hover:bg-gray-100 px-2 py-1.5 w-full mt-1 transition-colors"
                    >
                        <Plus size={14} />
                        Create issue
                    </button>
                </div>
            </div>

            <IssueDetails issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
            <CreateIssueModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </div>
    )
}

function BacklogItem({ id, title, priority, status, assignee, epic, onClick, isSelected }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0 group cursor-pointer transition-all border-l-2",
                isSelected
                    ? "bg-[#E6EFFC] border-l-[#0052cc]"
                    : "bg-white hover:bg-[#FAFBFC] border-l-transparent"
            )}
        >
            <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                    "w-4 h-4 rounded-[2px] flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                        ? "bg-[#0052cc] border-[#0052cc]"
                        : "border border-gray-300 bg-white group-hover:border-gray-400"
                )}>
                    {isSelected && <span className="text-[10px] text-white leading-none">✓</span>}
                </div>
                <span className={cn(
                    "text-sm font-medium truncate transition-colors",
                    isSelected ? "text-[#0052cc]" : "text-[#172B4D] group-hover:text-[#0052cc]"
                )}>{title}</span>
                {epic && (
                    <span className="text-[10px] font-bold bg-[#8777D9] text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                        {epic}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-[#626F86] font-medium">{id}</span>
                {assignee ? (
                    <div className="w-6 h-6 rounded-full bg-[#0052cc] flex items-center justify-center text-[10px] text-white font-bold" title={assignee}>
                        {assignee.charAt(0)}
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                        <UserCircle size={16} />
                    </div>
                )}
                <div className="w-20 text-right">
                    <span className="text-xs font-medium text-[#44546F] bg-gray-100/80 px-2 py-0.5 rounded-[3px]">
                        {status}
                    </span>
                </div>
                <div className="w-6 flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-[#626F86]">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

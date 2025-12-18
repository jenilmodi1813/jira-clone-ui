"use client"

import { X, Send, Link as LinkIcon, Trash2, Plus } from "lucide-react"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"

interface IssueDetailsProps {
    issue: Issue | null
    onClose: () => void
}

export function IssueDetails({ issue, onClose }: IssueDetailsProps) {
    if (!issue) return null

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-[var(--background)] shadow-2xl border-l border-[var(--border)] z-40 transform transition-transform duration-200 ease-in-out flex flex-col">
            <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <span className="uppercase">{issue.id}</span>
                    <span>/</span>
                    <span className="text-[var(--foreground)] truncate max-w-[200px]">{issue.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[var(--accent)] rounded text-[var(--muted-foreground)]"><LinkIcon size={18} /></button>
                    <button className="p-2 hover:bg-[var(--accent)] rounded text-[var(--muted-foreground)]"><Trash2 size={18} /></button>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded text-[var(--foreground)]">
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-4">{issue.title}</h1>
                    <div className="flex gap-2 mb-6">
                        <button className="flex items-center gap-2 bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm font-medium">
                            <LinkIcon size={14} /> Attach
                        </button>
                        <button className="flex items-center gap-2 bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm font-medium">
                            <Plus size={14} /> Create sub task
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Description</h3>
                            <div className="p-3 hover:bg-[var(--accent)] rounded min-h-[80px] cursor-text text-sm text-[var(--foreground)] border border-transparent hover:border-[var(--input)] transition-colors">
                                Add a description...
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase">Details</h3>

                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[var(--muted-foreground)]">Assignee</span>
                                    <div className="flex items-center gap-2 hover:bg-[var(--accent)] px-2 py-1 rounded cursor-pointer transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            {issue.assignee?.name?.charAt(0) || "U"}
                                        </div>
                                        <span className="text-sm text-[var(--foreground)]">{issue.assignee?.name || "Unassigned"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[var(--muted-foreground)]">Reporter</span>
                                    <div className="flex items-center gap-2 hover:bg-[var(--accent)] px-2 py-1 rounded cursor-pointer transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            J
                                        </div>
                                        <span className="text-sm text-[var(--foreground)]">Jenil</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted-foreground)]">Status</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{issue.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted-foreground)]">Priority</span>
                                    <span className="text-sm text-[var(--foreground)] capitalize">{issue.priority.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Comments</h3>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            JM
                        </div>
                        <div className="flex-1">
                            <div className="border border-[var(--input)] rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-[var(--background)]">
                                <textarea className="w-full p-3 min-h-[40px] max-h-[200px] outline-none bg-transparent resize-y text-sm" placeholder="Add a comment..."></textarea>
                                <div className="flex items-center justify-between px-2 py-1 border-t border-[var(--border)]">
                                    <span className="text-xs text-[var(--muted-foreground)]">Pro tip: press M to comment</span>
                                    <button className="px-3 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

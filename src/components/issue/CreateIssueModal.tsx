"use client"

import { X } from "lucide-react"

export function CreateIssueModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--background)] w-full max-w-2xl rounded-lg shadow-xl border border-[var(--border)] flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Create issue</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Issue Type</label>
                        <select className="w-full p-2 rounded border border-[var(--input)] bg-[var(--accent)] text-sm">
                            <option>Task</option>
                            <option>Story</option>
                            <option>Bug</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Short Summary</label>
                        <input type="text" className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="What needs to be done?" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Description</label>
                        <textarea className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the issue..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Assignee</label>
                            <select className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-sm">
                                <option>Automatic</option>
                                <option>Jenil</option>
                                <option>Antigravity</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Priority</label>
                            <select className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-sm">
                                <option>Medium</option>
                                <option>High</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 font-medium text-[var(--foreground)] hover:bg-[var(--accent)] rounded transition-colors">Cancel</button>
                    <button onClick={onClose} className="px-4 py-2 font-medium bg-[#0052cc] text-white hover:bg-blue-700 rounded transition-colors">Create</button>
                </div>
            </div>
        </div>
    )
}

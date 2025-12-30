"use client"

import { useState } from "react"
import { Board } from "./Board"
import { BoardFilters } from "./BoardFilters"
import { CreateIssueModal } from "../issue/CreateIssueModal"
import { IssueDetails } from "../issue/IssueDetails"
import { Issue } from "@/types"
import { useProject } from "@/context/ProjectContext"

export function BoardPageClient({ projectId }: { projectId: string }) {
    const { setIsCreateModalOpen } = useProject()
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

    return (
        <div className="h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-sm text-[var(--muted-foreground)] mb-1">Projects / {projectId}</div>
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">Kanban Board</h1>
                </div>
                <div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                        Create issue
                    </button>
                </div>
            </div>

            <BoardFilters />

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <Board onIssueClick={setSelectedIssue} />
            </div>

            <CreateIssueModal />
            <IssueDetails issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
        </div>
    )
}

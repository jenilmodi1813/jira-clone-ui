"use client"

import { useState, useEffect } from "react"
import { DragDropContext, DropResult, DragStart } from "@hello-pangea/dnd"
import { Search, Filter, ChevronDown, UserPlus, MoreHorizontal } from "lucide-react"
import { Column } from "./Column"
import { ColumnType, Issue, IssueStatus } from "@/types"

const MOCK_DATA: Record<string, Issue[]> = {
    TODO: [
        { id: "JIRA-1", title: "Set up project repository", status: "TODO", priority: "HIGH", assignee: { name: "Jenil" } },
        { id: "JIRA-2", title: "Design authentication flow", status: "TODO", priority: "MEDIUM" },
    ],
    IN_PROGRESS: [
        { id: "JIRA-3", title: "Implement Sidebar component", status: "IN_PROGRESS", priority: "HIGH", assignee: { name: "Antigravity" } },
    ],
    IN_REVIEW: [],
    IN_TESTING: [
        { id: "JIRA-4", title: "Initialize Next.js app", status: "IN_TESTING", priority: "LOW" },
    ],
    DONE: [],
}

interface BoardProps {
    onIssueClick?: (issue: Issue) => void
}

export function Board({ onIssueClick }: BoardProps) {
    const [enabled, setEnabled] = useState(false)
    const [columns, setColumns] = useState(MOCK_DATA)
    const [draggedFromStatus, setDraggedFromStatus] = useState<IssueStatus | null>(null)

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true))
        return () => {
            cancelAnimationFrame(animation)
            setEnabled(false)
        }
    }, [])

    const onDragStart = (start: DragStart) => {
        setDraggedFromStatus(start.source.droppableId as IssueStatus)
    }

    const onDragEnd = (result: DropResult) => {
        setDraggedFromStatus(null)
        if (!result.destination) return

        const { source, destination } = result

        // Enforce workflow: Only allow moving to DONE from IN_TESTING
        if (destination.droppableId === "DONE" && source.droppableId !== "IN_TESTING") {
            return
        }

        if (source.droppableId === destination.droppableId) {
            const columnId = source.droppableId
            const items = Array.from(columns[columnId])
            const [reorderedItem] = items.splice(source.index, 1)
            items.splice(destination.index, 0, reorderedItem)

            setColumns({
                ...columns,
                [columnId]: items,
            })
        } else {
            const sourceColumn = Array.from(columns[source.droppableId])
            const destColumn = Array.from(columns[destination.droppableId])
            const [movedItem] = sourceColumn.splice(source.index, 1)

            movedItem.status = destination.droppableId as any

            destColumn.splice(destination.index, 0, movedItem)

            setColumns({
                ...columns,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn,
            })
        }
    }

    const [searchQuery, setSearchQuery] = useState("")

    if (!enabled) {
        return (
            <div className="flex h-full items-start gap-6 p-6">
                {Object.entries(columns).map(([id, issues]) => (
                    <Column key={id} column={{ id: id as any, title: id.replace('_', ' '), issues }} onIssueClick={onIssueClick} isDragEnabled={false} />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Board Toolbar */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            placeholder="Search board"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-40 sm:w-64 pl-9 pr-4 rounded-[3px] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] transition-all hover:bg-gray-50"
                        />
                    </div>
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div className="w-8 h-8 rounded-full bg-[#0052cc] border-2 border-white flex items-center justify-center text-white text-xs font-bold">J</div>
                    </div>

                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-gray-100 rounded-[3px] transition-colors">
                        <Filter size={16} className="text-[var(--muted-foreground)]" />
                        <span>Filter</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#172B4D] hover:bg-gray-100 rounded-[3px] transition-colors bg-gray-50">
                        <span>Group</span>
                        <ChevronDown size={14} className="text-[var(--muted-foreground)]" />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#172B4D] hover:bg-gray-100 rounded-[3px] transition-colors bg-gray-50">
                        <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                            <span className="text-[10px] pb-1">↓</span>
                        </div>
                        <span>Import work</span>
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-[3px] text-[var(--muted-foreground)]">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Board Content */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4">
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="flex h-full items-start gap-6">
                        <Column column={{ id: "TODO", title: "TO DO", issues: columns["TODO"] }} onIssueClick={onIssueClick} draggedFromStatus={draggedFromStatus} />
                        <Column column={{ id: "IN_PROGRESS", title: "IN PROGRESS", issues: columns["IN_PROGRESS"] }} onIssueClick={onIssueClick} draggedFromStatus={draggedFromStatus} />
                        <Column column={{ id: "IN_REVIEW", title: "IN REVIEW", issues: columns["IN_REVIEW"] }} onIssueClick={onIssueClick} draggedFromStatus={draggedFromStatus} />
                        <Column column={{ id: "IN_TESTING", title: "IN TESTING", issues: columns["IN_TESTING"] }} onIssueClick={onIssueClick} draggedFromStatus={draggedFromStatus} />
                        <Column column={{ id: "DONE", title: "DONE", issues: columns["DONE"] }} onIssueClick={onIssueClick} draggedFromStatus={draggedFromStatus} />
                    </div>
                </DragDropContext>
            </div>
        </div>
    )
}

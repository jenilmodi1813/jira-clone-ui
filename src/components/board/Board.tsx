"use client"

import { useState, useEffect } from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { Column } from "./Column"
import { ColumnType, Issue } from "@/types"

const MOCK_DATA: Record<string, Issue[]> = {
    TODO: [
        { id: "JIRA-1", title: "Set up project repository", status: "TODO", priority: "HIGH", assignee: { name: "Jenil" } },
        { id: "JIRA-2", title: "Design authentication flow", status: "TODO", priority: "MEDIUM" },
    ],
    IN_PROGRESS: [
        { id: "JIRA-3", title: "Implement Sidebar component", status: "IN_PROGRESS", priority: "HIGH", assignee: { name: "Antigravity" } },
    ],
    DONE: [
        { id: "JIRA-4", title: "Initialize Next.js app", status: "DONE", priority: "LOW" },
    ],
}

interface BoardProps {
    onIssueClick?: (issue: Issue) => void
}

export function Board({ onIssueClick }: BoardProps) {
    const [enabled, setEnabled] = useState(false)
    const [columns, setColumns] = useState(MOCK_DATA)

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true))
        return () => {
            cancelAnimationFrame(animation)
            setEnabled(false)
        }
    }, [])

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const { source, destination } = result

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

    if (!enabled) {
        return (
            <div className="flex h-full items-start gap-2">
                {Object.entries(columns).map(([id, issues]) => (
                    <Column key={id} column={{ id: id as any, title: id.replace('_', ' '), issues }} onIssueClick={onIssueClick} isDragEnabled={false} />
                ))}
            </div>
        )
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full items-start gap-2">
                <Column column={{ id: "TODO", title: "To Do", issues: columns["TODO"] }} onIssueClick={onIssueClick} />
                <Column column={{ id: "IN_PROGRESS", title: "In Progress", issues: columns["IN_PROGRESS"] }} onIssueClick={onIssueClick} />
                <Column column={{ id: "DONE", title: "Done", issues: columns["DONE"] }} onIssueClick={onIssueClick} />
            </div>
        </DragDropContext>
    )
}

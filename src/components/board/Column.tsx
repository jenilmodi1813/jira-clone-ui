"use client"

import { Droppable } from "@hello-pangea/dnd"
import { ColumnType, Issue } from "@/types"
import { IssueCard } from "./IssueCard"
import { cn } from "@/lib/utils"

interface ColumnProps {
    column: ColumnType
    onIssueClick?: (issue: Issue) => void
    isDragEnabled?: boolean
}

export function Column({ column, onIssueClick, isDragEnabled = true }: ColumnProps) {
    return (
        <div className="flex flex-col w-[280px] min-w-[280px] bg-[var(--column-bg)] rounded-lg mx-2 max-h-full">
            <div className="p-3 flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    <span className="bg-gray-200 px-2 py-0.5 rounded-full text-[10px] text-gray-600">{column.issues.length}</span>
                </div>
            </div>

            {!isDragEnabled ? (
                <div className="flex-1 p-2 overflow-y-auto min-h-[100px]">
                    {column.issues.map((issue, index) => (
                        <IssueCard key={issue.id} issue={issue} index={index} onClick={() => onIssueClick?.(issue)} isDragEnabled={false} />
                    ))}
                </div>
            ) : (
                <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                                "flex-1 p-2 overflow-y-auto min-h-[100px] transition-colors",
                                snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                            )}
                        >
                            {column.issues.map((issue, index) => (
                                <IssueCard key={issue.id} issue={issue} index={index} onClick={() => onIssueClick?.(issue)} isDragEnabled={true} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    )
}

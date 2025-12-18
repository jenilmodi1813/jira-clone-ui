"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Lock } from "lucide-react"
import { ColumnType, Issue, IssueStatus } from "@/types"
import { IssueCard } from "./IssueCard"
import { cn } from "@/lib/utils"

interface ColumnProps {
    column: ColumnType
    onIssueClick?: (issue: Issue) => void
    isDragEnabled?: boolean
    draggedFromStatus?: IssueStatus | null
}

export function Column({ column, onIssueClick, isDragEnabled = true, draggedFromStatus }: ColumnProps) {
    const isRestricted = column.id === "DONE" && draggedFromStatus && draggedFromStatus !== "IN_TESTING"

    return (
        <div className="flex flex-col w-[280px] min-w-[280px] bg-[#F4F5F7] rounded-lg mx-2 max-h-full relative overflow-hidden">
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

            {/* Restricted Overlay */}
            {isRestricted && (
                <div className="absolute inset-x-0 bottom-0 top-[40px] bg-black/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-200">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                        <Lock className="text-white" size={24} />
                    </div>
                    <p className="text-white text-sm font-semibold mb-2">Workflow Restricted</p>
                    <p className="text-white/70 text-xs">
                        Issues can only be moved to <span className="text-white font-medium">DONE</span> from <span className="text-white font-medium">IN TESTING</span>.
                    </p>
                </div>
            )}
        </div>
    )
}

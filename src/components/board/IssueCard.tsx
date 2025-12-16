"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, MoreHorizontal } from "lucide-react"

interface IssueCardProps {
    issue: Issue
    index: number
    onClick?: () => void
    isDragEnabled?: boolean
}

export function IssueCard({ issue, index, onClick, isDragEnabled = true }: IssueCardProps) {
    if (!isDragEnabled) {
        return (
            <div
                onClick={onClick}
                className="p-3 mb-2 bg-[var(--card-bg)] shadow-sm rounded border border-transparent hover:bg-[var(--accent)] group transition-colors select-none"
            >
                <IssueCardContent issue={issue} />
            </div>
        )
    }

    return (
        <Draggable draggableId={issue.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    onClick={onClick}
                    className={cn(
                        "p-3 mb-2 bg-[var(--card-bg)] shadow-sm rounded border border-transparent hover:bg-[var(--accent)] group transition-colors select-none",
                        snapshot.isDragging && "shadow-lg rotate-2 bg-blue-50 border-blue-200"
                    )}
                >
                    <IssueCardContent issue={issue} />
                </div>
            )}
        </Draggable>
    )
}

function IssueCardContent({ issue }: { issue: Issue }) {
    return (
        <>
            <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-[var(--foreground)] font-medium leading-tight group-hover:text-blue-700 transition-colors">
                    {issue.title}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-[var(--muted-foreground)]">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <IssueTypeIcon priority={issue.priority} />
                    <span className="text-xs text-[var(--muted-foreground)] font-bold">{issue.id}</span>
                </div>

                {issue.assignee ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold" title={issue.assignee.name}>
                        {issue.assignee.name.charAt(0)}
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                        <UserIcon />
                    </div>
                )}
            </div>
        </>
    )
}

function IssueTypeIcon({ priority }: { priority: string }) {
    if (priority === 'HIGH') return <CheckCircle2 size={14} className="text-red-500" />
    if (priority === 'MEDIUM') return <Circle size={14} className="text-orange-400" />
    return <Clock size={14} className="text-green-500" />
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}

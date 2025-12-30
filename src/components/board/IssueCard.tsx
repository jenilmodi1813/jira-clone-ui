"use client"

import { useEffect } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"
import { MoreHorizontal } from "lucide-react"
import { IssueTypeIcon } from "@/components/ui/issue-type-icon"
import { useProject } from "@/context/ProjectContext"

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
                        "p-3 mb-2 bg-white shadow-[0px_1px_2px_0px_rgba(9,30,66,0.25)] rounded-[3px] border-none hover:bg-gray-50 group transition-colors select-none",
                        snapshot.isDragging && "shadow-lg rotate-2 bg-blue-50"
                    )}
                >
                    <IssueCardContent issue={issue} />
                </div>
            )}
        </Draggable>
    )
}

function IssueCardContent({ issue }: { issue: Issue }) {
    const { users, getUserProfile } = useProject()

    useEffect(() => {
        if (issue.assigneeId && !issue.assignee && !users[issue.assigneeId]) {
            getUserProfile(issue.assigneeId)
        }
    }, [issue.assigneeId, users, getUserProfile])

    const resolvedAssignee = issue.assignee || (issue.assigneeId ? users[issue.assigneeId] : undefined)
    const assigneeName = (resolvedAssignee as any)?.fullName || (resolvedAssignee as any)?.name || "Unassigned"

    return (
        <>
            <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-[#172B4D] font-medium leading-tight group-hover:text-[#0052cc] transition-colors">
                    {issue.title}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-[#626F86]">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Dummy Epic Label for visual match */}
            {issue.priority === 'HIGH' && (
                <div className="mt-2 mb-1">
                    <span className="bg-[#8777D9] text-white px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider">
                        Password Reset
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 grayscale-[0.2]">
                        <IssueTypeIcon type={issue.issueType} />
                        <PriorityIcon priority={issue.priority} />
                    </div>
                </div>

                {resolvedAssignee ? (
                    <div className="w-6 h-6 rounded-full bg-[#0052cc] flex items-center justify-center text-[10px] text-white font-bold border-2 border-white" title={assigneeName}>
                        {assigneeName.charAt(0)}
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                        <UserIcon />
                    </div>
                )}
            </div>
        </>
    )
}

function PriorityIcon({ priority }: { priority: string }) {
    if (priority === 'HIGH') return <div title="High Priority" className="text-red-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg></div>
    if (priority === 'MEDIUM') return <div title="Medium Priority" className="text-orange-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg></div>
    return <div title="Low Priority" className="text-blue-500 rotate-180"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg></div>
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}

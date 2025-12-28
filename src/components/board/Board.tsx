"use client"

import { useState, useEffect } from "react"
import { DragDropContext, DropResult, DragStart } from "@hello-pangea/dnd"
import { Search, Filter, ChevronDown, UserPlus, MoreHorizontal } from "lucide-react"
import { IssueTypeIcon } from "@/components/ui/issue-type-icon"
import { Column } from "./Column"
import { ColumnType, Issue, IssueStatus } from "@/types"
import { CreateIssueModal } from "@/components/issue/CreateIssueModal"
import { IssueDetails } from "@/components/issue/IssueDetails"
import { InviteUserModal } from "@/components/workspace/InviteUserModal"

import { useProject } from "@/context/ProjectContext"

interface BoardProps {
    onIssueClick?: (issue: Issue) => void
}

export function Board({ onIssueClick }: BoardProps) {
    const { issues, columns, moveIssue } = useProject()
    const [boardColumns, setBoardColumns] = useState<ColumnType[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [draggedFromStatus, setDraggedFromStatus] = useState<IssueStatus | null>(null)
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    useEffect(() => {
        console.log("[Board] Initializing columns. issues count:", issues.length, "columns count:", columns.length);
        console.log("[Board] Current issues:", issues);
        console.log("[Board] Current columns:", columns);

        const cols = columns.map(col => {
            const filteredIssues = issues.filter(issue => {
                const matchesColumnId = issue.boardColumnId === col.id;
                const matchesStatus = issue.status === col.id;
                return matchesColumnId || matchesStatus;
            });
            console.log(`[Board] Column ${col.name} (id: ${col.id}) has ${filteredIssues.length} issues`);
            return {
                id: col.id,
                title: col.name,
                issues: filteredIssues
            };
        });
        setBoardColumns(cols)
    }, [issues, columns])

    const onDragStart = (start: DragStart) => {
        setIsDragging(true)
        setDraggedFromStatus(start.source.droppableId as IssueStatus)
    }

    const onDragEnd = (result: DropResult) => {
        setIsDragging(false)
        setDraggedFromStatus(null)

        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        moveIssue(source.droppableId as IssueStatus, destination.droppableId as IssueStatus, source.index, destination.index)
    }

    const handleIssueClick = (issue: Issue) => {
        if (selectedIssue?.id === issue.id) {
            setSelectedIssue(null)
            return
        }
        setSelectedIssue(issue)
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-semibold text-[#172B4D]">Kanban board</h1>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search board"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-[3px] text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex -space-x-2 mr-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                        title="Invite member"
                    >
                        <UserPlus size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium flex items-center gap-2 text-gray-700">
                        <Filter size={14} /> Quick filters <ChevronDown size={14} />
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-2" />
                    <span className="text-xs text-gray-500">Only my issues</span>
                    <span className="text-xs text-gray-500">Recently updated</span>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto min-h-0 px-4">
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="flex h-full pb-8">
                        {boardColumns.map(column => (
                            <Column
                                key={column.id}
                                column={column}
                                onIssueClick={handleIssueClick}
                                isDragEnabled={true}
                                draggedFromStatus={draggedFromStatus}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </div>

            <IssueDetails issue={selectedIssue ? issues.find(i => i.id === selectedIssue.id) || null : null} onClose={() => setSelectedIssue(null)} />
            <CreateIssueModal />

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                orgId="7ef1dab2-e0c7-4d73-8aad-d9f469044eda"
                orgName="Workspace"
            />
        </div>
    )
}

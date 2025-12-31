"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Search, UserCircle, Calendar, ArrowRight, Loader2, ListFilter, X } from "lucide-react"
import { IssueDetails } from "@/components/issue/IssueDetails"
import { CreateIssueModal } from "@/components/issue/CreateIssueModal"
import { BacklogFilterDropdown } from "./BacklogFilterDropdown"
import { IssueTypeIcon } from "@/components/ui/issue-type-icon"
import { workspaceApi, OrganizationMemberResponse } from "@/features/workspace/api/workspace-api"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"

import { useProject } from "@/context/ProjectContext"

export function Backlog() {
    const {
        issues,
        currentBoard,
        currentProject,
        addIssue,
        columns,
        isCreateModalOpen,
        setIsCreateModalOpen,
        searchQuery,
        setSearchQuery,
        selectedAssigneeIds,
        toggleAssigneeFilter,
        selectedStatusIds,
        selectedPriorityIds,
        clearAllFilters,
        activeFilterCount,
        members,
        isFetchingMembers
    } = useProject()
    const { data: session } = useSession()
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
    const [isCreatingIssue, setIsCreatingIssue] = useState(false)
    const [newIssueTitle, setNewIssueTitle] = useState("")
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)

    // UI state only
    const [isCreatingBoard, setIsCreatingBoard] = useState(false)
    const [newBoardName, setNewBoardName] = useState("")
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

    const handleIssueClick = (issue: Issue) => {
        if (selectedIssue?.id === issue.id) {
            setSelectedIssue(null)
            return
        }
        setSelectedIssue(issue)
    }

    const filterIssues = (issueList: Issue[]) => {
        return issueList.filter(issue => {
            const matchesSearch = !searchQuery ||
                issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.description?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesAssignee = selectedAssigneeIds.length === 0 ||
                (issue.assigneeId && selectedAssigneeIds.includes(issue.assigneeId))

            // Robust status matching: resolve issue status string to its column ID
            const issueStatusId = columns.find(c =>
                c.id === issue.status ||
                c.name.toUpperCase().replace(/\s+/g, '_') === (issue.status || "").toUpperCase().replace(/\s+/g, '_')
            )?.id || issue.status;

            const matchesStatus = selectedStatusIds.length === 0 ||
                selectedStatusIds.includes(issueStatusId) ||
                (issue.boardColumnId && selectedStatusIds.includes(issue.boardColumnId))

            const matchesPriority = selectedPriorityIds.length === 0 ||
                selectedPriorityIds.includes(issue.priority)

            return matchesSearch && matchesAssignee && matchesStatus && matchesPriority
        })
    }

    const getNormalizedStatus = (statusId: string) => {
        const column = columns.find(c => c.id === statusId)
        if (!column) return statusId.toUpperCase().replace(/\s+/g, '_')
        return column.name.toUpperCase().replace(/\s+/g, '_')
    }

    const boardIssues = filterIssues(issues.filter(i => {
        // Find which column this issue belongs to
        const columnIndex = columns.findIndex(c => c.id === i.status || c.id === i.boardColumnId)

        // Board issues are those in middle columns (not first, not last)
        // If there's only 1 or 2 columns, fallback to status name matching
        if (columns.length <= 2) {
            const status = getNormalizedStatus(i.status)
            return ["IN_PROGRESS", "IN_REVIEW", "IN_TESTING"].includes(status)
        }

        return columnIndex > 0 && columnIndex < columns.length - 1
    }))

    const backlogIssues = filterIssues(issues.filter(i => {
        const columnIndex = columns.findIndex(c => c.id === i.status || c.id === i.boardColumnId)

        if (columns.length <= 2) {
            const status = getNormalizedStatus(i.status)
            return ["TODO", "DONE"].includes(status) || !["IN_PROGRESS", "IN_REVIEW", "IN_TESTING"].includes(status)
        }

        // Backlog issues are those in the first column or last column (Done)
        return columnIndex === 0 || columnIndex === columns.length - 1 || columnIndex === -1
    }))

    // const allFilteredIssues = filterIssues(issues) // This is no longer used directly for rendering lists

    const handleCreateIssue = async () => {
        if (!newIssueTitle.trim() || !currentProject) {
            setIsCreatingIssue(false)
            return
        }

        setIsSubmittingIssue(true)
        try {
            const { workspaceApi, ISSUE_CONSTANTS } = await import("@/features/workspace/api/workspace-api")

            // Resolve dynamic column
            // 1. Resolve dynamic column (Target position 1)
            let boardColumnId = ISSUE_CONSTANTS.BOARD_COLUMN_ID;
            try {
                const board = await workspaceApi.getBoardByProject(currentProject.id);
                if (board) {
                    const cols = await workspaceApi.getBoardColumns(board.id);
                    if (cols && cols.length > 0) {
                        const targetCol = cols.find(c => c.position === 1) || cols[0];
                        boardColumnId = targetCol.id;
                        console.log(`[Backlog] Using dynamic column: ${targetCol.name} (id: ${targetCol.id}, position: ${targetCol.position})`);
                    }
                }
            } catch (e) {
                console.warn("[Backlog] Failed to fetch dynamic columns, using fallback:", e);
            }

            // 2. Resolve dynamic Epic
            const targetEpicUuid = ISSUE_CONSTANTS.ISSUE_TYPES.EPIC;
            const epicIssue = issues.find(i => (i as any).issueTypeId === targetEpicUuid || (i.issueType as string) === "EPIC");
            const epicId = epicIssue?.id || undefined;

            // 3. Resolve dynamic Assignee (Default to self)
            // Handle Case where session user ID is "1" which backend rejects as invalid UUID
            const rawUserId = session?.user?.id || (session?.user as any)?.userId;
            const assigneeId = (rawUserId && rawUserId !== "1") ? rawUserId : ISSUE_CONSTANTS.ASSIGNEE_ID;

            const newIssue = await workspaceApi.createIssue({
                title: newIssueTitle,
                projectId: currentProject.id,
                boardColumnId: boardColumnId,
                issueTypeId: ISSUE_CONSTANTS.ISSUE_TYPES.TASK,
                priority: "MEDIUM",
                epicId: epicId,
                assigneeId: assigneeId
            })

            addIssue(newIssue)
            setNewIssueTitle("")
            setIsCreatingIssue(false)
        } catch (error) {
            console.error("Failed to create issue:", error)
        } finally {
            setIsSubmittingIssue(false)
        }
    }

    const handleCreateBoard = async () => {
        if (!newBoardName.trim() || !currentProject) {
            setIsCreatingBoard(false)
            return
        }
        console.log("Handle Create Board Triggered", newBoardName)
        try {
            const { workspaceApi } = await import("@/features/workspace/api/workspace-api")
            // Resolve project ID safely
            const projectId = currentProject.id;

            await workspaceApi.createBoard({
                name: newBoardName,
                projectId: projectId,
                type: "KANBAN"
            })
            setNewBoardName("")
            setIsCreatingBoard(false)
            // Ideally trigger refresh here. Reloading page as per previous plan for immediate feedback.
            window.location.reload()
        } catch (error) {
            console.error("Failed to create board:", error)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Backlog Header (Filters) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-20">
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-[3px] border text-sm font-medium transition-all",
                                isFilterDropdownOpen || activeFilterCount > 0
                                    ? "border-[#0052cc] bg-[#E6EFFC] text-[#0052cc]"
                                    : "border-gray-300 hover:bg-gray-50 text-[#44546F]"
                            )}
                        >
                            <ListFilter size={16} />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 bg-[#0052cc] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <BacklogFilterDropdown
                            isOpen={isFilterDropdownOpen}
                            onClose={() => setIsFilterDropdownOpen(false)}
                            members={members}
                        />
                    </div>

                    <div className="h-4 w-px bg-gray-200 mx-2" />

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search backlog"
                            className="h-9 w-40 sm:w-64 pl-9 pr-4 rounded-[3px] border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {(activeFilterCount > 0 || searchQuery) && (
                        <button
                            onClick={clearAllFilters}
                            className="text-xs font-semibold text-[#0052cc] hover:underline mr-4"
                        >
                            Clear all filters
                        </button>
                    )}
                    <div className="flex -space-x-2 mr-2">
                        {members.slice(0, 5).map(member => {
                            const isActive = selectedAssigneeIds.includes(member.userId)
                            return (
                                <div
                                    key={member.userId}
                                    onClick={() => toggleAssigneeFilter(member.userId)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:-translate-y-1",
                                        isActive ? "bg-blue-600 text-white z-10" : "bg-blue-500 text-white"
                                    )}
                                    title={member.displayName || member.email}
                                >
                                    {(member.displayName || member.email).charAt(0).toUpperCase()}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                {/* Sprint (Board) Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-[#172B4D]">
                                {currentBoard?.name || "Board"}
                                {currentProject?.projectKey && <span className="text-xs text-[#626F86] ml-2 font-normal">({currentProject.projectKey})</span>}
                            </h3>
                            <span className="text-xs text-[#626F86]">• {boardIssues.length} issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-[3px] font-bold uppercase">Complete Board</span>
                            <button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} /></button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[3px] overflow-hidden">
                        {boardIssues.map(issue => (
                            <BacklogItem
                                key={issue.id}
                                id={issue.id}
                                title={issue.title}
                                priority={issue.priority}
                                status={issue.status}
                                type={issue.issueType}
                                assignee={issue.assignee?.name}
                                assigneeId={issue.assigneeId}
                                isSelected={selectedIssue?.id === issue.id}
                                onClick={() => handleIssueClick(issue)}
                            />
                        ))}
                    </div>

                    {isCreatingBoard ? (
                        <div className="mt-1 relative group">
                            <input
                                autoFocus
                                type="text"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                onKeyDown={(e) => {
                                    e.stopPropagation()
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleCreateBoard()
                                    }
                                    if (e.key === "Escape") setIsCreatingBoard(false)
                                }}
                                placeholder="Enter board name..."
                                className="w-full h-8 pl-2 pr-8 text-sm border-2 border-[#0052cc] rounded-[3px] focus:outline-none bg-white shadow-sm"
                            />
                            <button
                                onClick={handleCreateBoard}
                                disabled={!newBoardName.trim()}
                                title="Create Board"
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-[#0052cc] hover:bg-blue-50 rounded-[3px] transition-all disabled:opacity-30 disabled:hover:bg-transparent group/btn"
                            >
                                <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setIsCreatingIssue(false)
                                setIsCreatingBoard(true)
                            }}
                            className="flex items-center gap-1 text-xs font-medium text-[#44546F] hover:bg-gray-100 px-2 py-1.5 w-full mt-1 transition-colors"
                        >
                            <Plus size={14} />
                            Create Board
                        </button>
                    )}
                </div>

                {/* Backlog Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-[#172B4D]">Backlog</h3>
                            <span className="text-xs text-[#626F86] font-medium">• {backlogIssues.length} issues</span>
                        </div>
                        <button className="bg-gray-100 hover:bg-gray-200 text-[#172B4D] text-xs px-2 py-1 rounded-[3px] font-medium">
                            Create Sprint
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[3px]">
                        {backlogIssues.map(issue => (
                            <BacklogItem
                                key={issue.id}
                                id={issue.id}
                                title={issue.title}
                                priority={issue.priority}
                                status={issue.status}
                                type={issue.issueType}
                                assignee={issue.assignee?.name}
                                assigneeId={issue.assigneeId}
                                isSelected={selectedIssue?.id === issue.id}
                                onClick={() => handleIssueClick(issue)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-1 text-xs font-medium text-[#44546F] hover:bg-gray-100 px-2 py-1.5 w-full mt-1 transition-colors"
                    >
                        <Plus size={14} />
                        Create issue
                    </button>
                </div>
            </div>

            <IssueDetails issue={selectedIssue ? issues.find(i => i.id === selectedIssue.id) || null : null} onClose={() => setSelectedIssue(null)} />
            {/* Modal for creating issues */}
            <CreateIssueModal />
        </div>
    )
}

function BacklogItem({ id, title, priority, status, assignee, assigneeId, type, epic, onClick, isSelected }: any) {
    const { users, getUserProfile } = useProject()

    useEffect(() => {
        if (assigneeId && !assignee && !users[assigneeId]) {
            getUserProfile(assigneeId)
        }
    }, [assigneeId, assignee, users, getUserProfile])

    const displayName = assignee || (assigneeId ? users[assigneeId]?.name : undefined)

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0 group cursor-pointer transition-all border-l-2",
                isSelected
                    ? "bg-[#E6EFFC] border-l-[#0052cc]"
                    : "bg-white hover:bg-[#FAFBFC] border-l-transparent"
            )}
        >
            <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                    "w-4 h-4 rounded-[2px] flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                        ? "bg-[#0052cc] border-[#0052cc]"
                        : "border border-gray-300 bg-white group-hover:border-gray-400"
                )}>
                    {isSelected && <span className="text-[10px] text-white leading-none">✓</span>}
                </div>
                <IssueTypeIcon type={type} />
                <span className={cn(
                    "text-sm font-medium truncate transition-colors",
                    isSelected ? "text-[#0052cc]" : "text-[#172B4D] group-hover:text-[#0052cc]"
                )}>{title}</span>
                {epic && (
                    <span className="text-[10px] font-bold bg-[#8777D9] text-white px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                        {epic}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {displayName ? (
                    <div className="w-6 h-6 rounded-full bg-[#0052cc] flex items-center justify-center text-[10px] text-white font-bold" title={displayName}>
                        {displayName.charAt(0)}
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                        <UserCircle size={16} />
                    </div>
                )}
                <div className="w-20 text-right">
                    <span className="text-xs font-medium text-[#44546F] bg-gray-100/80 px-2 py-0.5 rounded-[3px]">
                        {status}
                    </span>
                </div>
                <div className="w-6 flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-[#626F86]">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

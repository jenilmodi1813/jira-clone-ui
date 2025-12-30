"use client"

import React, { createContext, useContext, useState, useRef } from "react"
import { Issue, IssueStatus } from "@/types"

interface ProjectContextType {
    issues: Issue[]
    columns: { id: string, name: string }[]
    currentProject: { id: string, name: string, projectKey: string } | null
    currentBoard: { id: string, name: string, type: string } | null
    currentOrg: { id: string, name: string } | null
    setCurrentProject: (project: { id: string, name: string, projectKey: string } | null) => void
    setCurrentBoard: (board: { id: string, name: string, type: string } | null) => void
    setCurrentOrg: (org: { id: string, name: string } | null) => void
    updateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
    reorderIssues: (status: IssueStatus, startIndex: number, endIndex: number) => void
    moveIssue: (sourceStatus: IssueStatus, destStatus: IssueStatus, sourceIndex: number, destIndex: number) => void
    addIssue: (issue: Issue) => void
    updateIssue: (issueId: string, updates: Partial<Issue>) => void
    deleteIssue: (issueId: string) => void
    setIssues: (issues: Issue[]) => void
    setColumns: (columns: { id: string, name: string }[]) => void
    isCreateModalOpen: boolean
    setIsCreateModalOpen: (open: boolean) => void
    users: Record<string, { fullName?: string, name?: string, avatar?: string }>
    getUserProfile: (userId: string) => Promise<void>
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedAssigneeIds: string[]
    setSelectedAssigneeIds: (ids: string[]) => void
    toggleAssigneeFilter: (userId: string) => void
}

const INITIAL_ISSUES: Issue[] = []

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const DEFAULT_COLUMNS = [
    { id: "TODO", name: "TO DO" },
    { id: "IN_PROGRESS", name: "IN PROGRESS" },
    { id: "IN_REVIEW", name: "IN REVIEW" },
    { id: "IN_TESTING", name: "IN TESTING" },
    { id: "DONE", name: "DONE" }
]

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES)
    const [columns, setColumns] = useState<{ id: string, name: string }[]>(DEFAULT_COLUMNS)
    const [currentProject, setCurrentProject] = useState<{ id: string, name: string, projectKey: string } | null>(null)
    const [currentBoard, setCurrentBoard] = useState<{ id: string, name: string, type: string } | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [users, setUsersCache] = useState<Record<string, { fullName?: string, name?: string, avatar?: string }>>({});
    const loadingUserIds = useRef<Set<string>>(new Set());

    const [currentOrg, setCurrentOrg] = useState<{ id: string, name: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([])

    const toggleAssigneeFilter = (userId: string) => {
        setSelectedAssigneeIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const getUserProfile = async (userId: string) => {
        if (!userId || users[userId]) return;
        if (loadingUserIds.current.has(userId)) return; // already fetching
        loadingUserIds.current.add(userId);
        try {
            const { workspaceApi } = await import("@/features/workspace/api/workspace-api");
            const profile = await workspaceApi.getProfileById(userId);
            setUsersCache(prev => ({ ...prev, [userId]: profile }));
        } catch (error) {
            console.error(`Failed to fetch profile for ${userId}:`, error);
        } finally {
            loadingUserIds.current.delete(userId);
        }
    }

    const updateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
        setIssues(prev => prev.map(issue =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
        ))
    }

    const reorderIssues = (status: IssueStatus, startIndex: number, endIndex: number) => {
        setIssues(prev => {
            const columnIssues = prev.filter(i => i.status === status)
            const otherIssues = prev.filter(i => i.status !== status)

            const result = Array.from(columnIssues)
            const [removed] = result.splice(startIndex, 1)
            result.splice(endIndex, 0, removed)

            // To maintain order across sessions/reloads, we'd need a 'rank' or 'index' field
            // For now, we'll just reconstruct the list
            return [...otherIssues, ...result]
        })
    }

    const moveIssue = async (sourceColumnId: string, destColumnId: string, sourceIndex: number, destIndex: number) => {
        // Find the issue to move
        const columnIssues = issues.filter(i => i.boardColumnId === sourceColumnId);
        const movedItem = columnIssues[sourceIndex];

        if (!movedItem) return;

        // Workflow Validation: DONE can only come from IN TESTING
        const sourceCol = columns.find(c => c.id === sourceColumnId);
        const destCol = columns.find(c => c.id === destColumnId);

        if (destCol?.name.toUpperCase() === "DONE") {
            const isFromTesting = sourceCol?.name.toUpperCase() === "IN TESTING" || sourceCol?.name.toUpperCase() === "TESTING";
            if (!isFromTesting) {
                console.warn("[ProjectContext] Move rejected: Issues can only be moved to DONE from IN TESTING");
                return;
            }
        }

        // 1. Optimistic Update
        setIssues(prev => {
            const sourceIssues = prev.filter(i => i.boardColumnId === sourceColumnId)
            const destIssues = prev.filter(i => i.boardColumnId === destColumnId)
            const otherIssues = prev.filter(i => i.boardColumnId !== sourceColumnId && i.boardColumnId !== destColumnId)

            const [removed] = sourceIssues.splice(sourceIndex, 1)
            const updatedItem = { ...removed, boardColumnId: destColumnId, status: destColumnId as any }

            destIssues.splice(destIndex, 0, updatedItem)

            return [...otherIssues, ...sourceIssues, ...destIssues]
        });

        // 2. Backend Call
        try {
            const { workspaceApi } = await import("@/features/workspace/api/workspace-api");
            await workspaceApi.moveIssue(movedItem.id, destColumnId);
            console.log(`[ProjectContext] Successfully moved issue ${movedItem.id} to column ${destColumnId}`);
        } catch (error) {
            console.error("[ProjectContext] Failed to move issue on backend:", error);
            // Revert on failure (to be simple, just reload issues or leave as is for now)
            // Ideally we should revert the state but let's see if this is enough
        }
    }

    const addIssue = (issue: Issue) => {
        setIssues(prev => [...prev, issue])
    }

    const updateIssue = (issueId: string, updates: Partial<Issue>) => {
        setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updates } : i))
    }

    const deleteIssue = (issueId: string) => {
        setIssues(prev => prev.filter(i => i.id !== issueId))
    }

    return (
        <ProjectContext.Provider value={{
            issues,
            columns,
            currentProject,
            currentBoard,
            currentOrg,
            setCurrentProject,
            setCurrentBoard,
            setCurrentOrg,
            updateIssueStatus,
            reorderIssues,
            moveIssue,
            addIssue,
            updateIssue,
            deleteIssue,
            setIssues,
            setColumns,
            isCreateModalOpen,
            setIsCreateModalOpen,
            users,
            getUserProfile,
            searchQuery,
            setSearchQuery,
            selectedAssigneeIds,
            setSelectedAssigneeIds,
            toggleAssigneeFilter
        }}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider")
    }
    return context
}

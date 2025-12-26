import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Link as LinkIcon, Trash2, MoreHorizontal, MessageSquare, Plus, Loader2, ArrowRight } from "lucide-react"
import { IssueTypeIcon } from "@/components/ui/issue-type-icon"
import { Issue } from "@/types"
import { cn } from "@/lib/utils"
import { workspaceApi } from "@/features/workspace/api/workspace-api"
import { useProject } from "@/context/ProjectContext"

interface IssueDetailsProps {
    issue: Issue | null
    onClose: () => void
}

export function IssueDetails({ issue, onClose }: IssueDetailsProps) {
    const { issues, deleteIssue, currentProject, updateIssue, columns, addIssue, users, getUserProfile } = useProject()
    const { data: session } = useSession()
    const [isDeleting, setIsDeleting] = useState(false)

    // Subtasks logic
    const [isCreatingSubTask, setIsCreatingSubTask] = useState(false)
    const [newSubTaskTitle, setNewSubTaskTitle] = useState("")
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false)

    const subTasks = issues.filter((i: Issue) => (i as any).parentIssueId === issue?.id || (i as any).parentIssueId?.id === issue?.id)

    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [editDesc, setEditDesc] = useState("")

    useEffect(() => {
        if (issue) {
            if (issue.assigneeId && !issue.assignee && !users[issue.assigneeId]) {
                getUserProfile(issue.assigneeId)
            }
            if (issue.reporterId && !users[issue.reporterId]) {
                getUserProfile(issue.reporterId)
            }
        }
    }, [issue, users, getUserProfile])

    useEffect(() => {
        if (!issue?.id) {
            setEditTitle("")
            setEditDesc("")
            setIsCreatingSubTask(false)
            return
        }

        const currentIssue = issues.find(i => i.id === issue.id);
        if (currentIssue) {
            setEditTitle(currentIssue.title);
            setEditDesc(currentIssue.description || "");
        }
    }, [issue?.id, issues])

    const handleTitleUpdate = async () => {
        if (!issue?.id || !editTitle.trim() || editTitle === issue?.title) {
            setIsEditingTitle(false)
            return
        }
        try {
            const updated = await workspaceApi.updateIssue(issue.id, { title: editTitle })
            updateIssue(issue.id, { title: editTitle })
            // Note: We might need a global updateIssueTitle in context if we want Board/Sidebar to refresh
        } catch (error) {
            console.error("Failed to update title:", error)
        } finally {
            setIsEditingTitle(false)
        }
    }

    const handleDescUpdate = async () => {
        if (!issue?.id || editDesc === (issue?.description || "")) {
            setIsEditingDesc(false)
            return
        }
        try {
            const updated = await workspaceApi.updateIssue(issue.id, { description: editDesc })
            updateIssue(issue.id, { description: editDesc })
        } catch (error) {
            console.error("Failed to update description:", error)
        } finally {
            setIsEditingDesc(false)
        }
    }

    const handleDelete = async () => {
        if (!issue?.id) return
        if (!confirm("Are you sure you want to delete this issue?")) return

        setIsDeleting(true)
        try {
            await workspaceApi.deleteIssue(issue.id)
            deleteIssue(issue.id)
            onClose()
        } catch (error) {
            console.error("Failed to delete issue:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateSubTask = async () => {
        if (!newSubTaskTitle.trim() || !issue?.id) return
        setIsSubmittingSubTask(true)
        try {
            const { workspaceApi, ISSUE_CONSTANTS } = await import("@/features/workspace/api/workspace-api")

            // 3. Resolve dynamic Assignee (Default to self)
            // Handle Case where session user ID is "1" which backend rejects as invalid UUID
            const rawUserId = session?.user?.id || (session?.user as any)?.userId;
            const assigneeId = (rawUserId && rawUserId !== "1") ? rawUserId : ISSUE_CONSTANTS.ASSIGNEE_ID;

            const subTask = await workspaceApi.createSubTask(issue.id, {
                title: newSubTaskTitle,
                description: "",
                assigneeId: assigneeId,
                priority: "MEDIUM"
            })
            addIssue(subTask)
            setNewSubTaskTitle("")
            setIsCreatingSubTask(false)
        } catch (error) {
            console.error("Failed to create subtask:", error)
        } finally {
            setIsSubmittingSubTask(false)
        }
    }

    if (!issue) return null

    const displayIssue = issues.find(i => i.id === issue.id) || issue

    // Name resolution logic
    const resolvedAssignee = displayIssue.assignee || (displayIssue.assigneeId ? users[displayIssue.assigneeId] : undefined)
    const assigneeName = (resolvedAssignee as any)?.fullName || (resolvedAssignee as any)?.name || (displayIssue.assigneeId ? "Loading..." : "Unassigned")

    const resolvedReporter = displayIssue.reporterId ? users[displayIssue.reporterId] : undefined
    const reporterName = (resolvedReporter as any)?.fullName || (resolvedReporter as any)?.name || (displayIssue.reporterId ? "Loading..." : "User")

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 w-[600px] bg-[var(--background)] shadow-2xl border-l border-[var(--border)] z-40 transform transition-transform duration-200 ease-in-out flex flex-col",
            issue ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6">
                <div className="flex items-center gap-3 text-sm">
                    <IssueTypeIcon type={displayIssue.issueType} className="scale-110" />
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <span className="text-[var(--foreground)] truncate max-w-[200px] font-medium">{displayIssue.title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[var(--accent)] rounded text-[var(--muted-foreground)]"><LinkIcon size={18} /></button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded text-[var(--foreground)]">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 pt-6">
                <div className="mb-6">
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleTitleUpdate}
                            onKeyDown={(e) => e.key === "Enter" && handleTitleUpdate()}
                            className="text-2xl font-semibold text-[var(--foreground)] mb-4 w-full bg-[var(--background)] border-2 border-blue-500 rounded px-2 outline-none"
                        />
                    ) : (
                        <h1
                            onClick={() => setIsEditingTitle(true)}
                            className="text-2xl font-semibold text-[var(--foreground)] mb-4 hover:bg-[var(--accent)] px-2 -ml-2 rounded cursor-text transition-colors"
                        >
                            {displayIssue.title}
                        </h1>
                    )}

                    <div className="flex gap-2 mb-8">
                        <button className="flex items-center gap-2 bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm font-medium">
                            <LinkIcon size={14} /> Attach
                        </button>
                        <button
                            onClick={() => setIsCreatingSubTask(true)}
                            className="flex items-center gap-2 bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <Plus size={14} /> Create sub task
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Description</h3>
                            {isEditingDesc ? (
                                <div className="space-y-2">
                                    <textarea
                                        autoFocus
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        className="w-full p-3 bg-[var(--background)] border-2 border-blue-500 rounded min-h-[120px] text-sm text-[var(--foreground)] outline-none resize-y"
                                        placeholder="Add a description..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDescUpdate}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingDesc(false)
                                                setEditDesc(issue?.description || "")
                                            }}
                                            className="px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setIsEditingDesc(true)}
                                    className="p-3 hover:bg-[var(--accent)] rounded min-h-[80px] cursor-text text-sm text-[var(--foreground)] border border-transparent hover:border-[var(--input)] transition-colors whitespace-pre-wrap"
                                >
                                    {displayIssue.description || "Add a description..."}
                                </div>
                            )}
                        </div>

                        {/* Subtasks Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center justify-between">
                                Sub tasks
                                <span className="text-xs font-normal text-[var(--muted-foreground)]">{subTasks.length}</span>
                            </h3>
                            <div className="space-y-1">
                                {subTasks.map((st: Issue) => (
                                    <div key={st.id} className="flex items-center gap-3 p-2 hover:bg-[var(--accent)] rounded group border border-transparent hover:border-[var(--border)] transition-all cursor-pointer">
                                        <div className="w-4 h-4 rounded-[2px] border border-gray-300 bg-white flex items-center justify-center text-[10px] text-white">✓</div>
                                        <span className="text-sm text-[var(--foreground)] flex-1 truncate">{st.title}</span>
                                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                            {st.status}
                                        </span>
                                    </div>
                                ))}

                                {isCreatingSubTask ? (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newSubTaskTitle}
                                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleCreateSubTask()
                                                if (e.key === "Escape") setIsCreatingSubTask(false)
                                            }}
                                            disabled={isSubmittingSubTask}
                                            placeholder="What needs to be done?"
                                            className="flex-1 h-8 px-2 text-sm border-2 border-blue-500 rounded outline-none"
                                        />
                                        <button
                                            onClick={handleCreateSubTask}
                                            disabled={isSubmittingSubTask || !newSubTaskTitle.trim()}
                                            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingSubTask ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCreatingSubTask(true)}
                                        className="w-full text-left text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] p-2 rounded flex items-center gap-2 transition-colors mt-1"
                                    >
                                        <Plus size={12} /> Add a sub task
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase">Details</h3>

                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[var(--muted-foreground)]">Assignee</span>
                                    <div className="flex items-center gap-2 hover:bg-[var(--accent)] px-2 py-1 rounded cursor-pointer transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            {assigneeName.charAt(0)}
                                        </div>
                                        <span className="text-sm text-[var(--foreground)]">{assigneeName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[var(--muted-foreground)]">Reporter</span>
                                    <div className="flex items-center gap-2 hover:bg-[var(--accent)] px-2 py-1 rounded cursor-pointer transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            {reporterName.charAt(0)}
                                        </div>
                                        <span className="text-sm text-[var(--foreground)]">{reporterName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted-foreground)]">Status</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{displayIssue.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[var(--muted-foreground)]">Priority</span>
                                    <span className="text-sm text-[var(--foreground)] capitalize">{displayIssue.priority.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Comments</h3>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            JM
                        </div>
                        <div className="flex-1">
                            <div className="border border-[var(--input)] rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-[var(--background)]">
                                <textarea className="w-full p-3 min-h-[40px] max-h-[200px] outline-none bg-transparent resize-y text-sm" placeholder="Add a comment..."></textarea>
                                <div className="flex items-center justify-between px-2 py-1 border-t border-[var(--border)]">
                                    <span className="text-xs text-[var(--muted-foreground)]">Pro tip: press M to comment</span>
                                    <button className="px-3 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">Save</button>
                                </div>
                                <div className="pt-4 border-t border-[var(--border)] space-y-2">
                                    <div className="flex justify-between text-[11px] text-[var(--muted-foreground)] px-1">
                                        <span>Created {displayIssue.createdAt ? new Date(displayIssue.createdAt).toLocaleDateString() : 'Unknown'}</span>
                                        <span>Updated {displayIssue.updatedAt ? new Date(displayIssue.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

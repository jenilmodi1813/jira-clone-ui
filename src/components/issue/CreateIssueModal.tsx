import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useProject } from "@/context/ProjectContext"
import { workspaceApi } from "@/features/workspace/api/workspace-api"
import { IssueTypeIcon, IssueType } from "@/components/ui/issue-type-icon"

export function CreateIssueModal() {
    const { currentProject, currentOrg, addIssue, isCreateModalOpen, setIsCreateModalOpen, issues } = useProject()
    const { data: session } = useSession()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("MEDIUM")
    const [issueType, setIssueType] = useState<IssueType>("TASK")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Invite State
    const [inviteEmail, setInviteEmail] = useState("")

    if (!isCreateModalOpen) return null

    const onClose = () => setIsCreateModalOpen(false)

    const handleCreate = async () => {
        if (!title.trim() || !currentProject) return

        setIsSubmitting(true)
        try {
            const { workspaceApi, ISSUE_CONSTANTS } = await import("@/features/workspace/api/workspace-api")

            // Handle Invite if email is provided
            if (inviteEmail.trim() && currentOrg) {
                try {
                    await workspaceApi.inviteUser(currentOrg.id, inviteEmail)
                    console.log("User invited successfully")
                } catch (inviteError) {
                    console.error("Invite failed, but proceeding with issue creation:", inviteError)
                }
            }

            // Map the selected string type to the UUID
            const typeId = ISSUE_CONSTANTS.ISSUE_TYPES[issueType as keyof typeof ISSUE_CONSTANTS.ISSUE_TYPES] || ISSUE_CONSTANTS.ISSUE_TYPES.TASK

            // 1. Resolve dynamic column (Target position 1)
            let boardColumnId = ISSUE_CONSTANTS.BOARD_COLUMN_ID;
            console.log(`[Diagnostic] Starting column resolution for project: ${currentProject.id}`);
            try {
                const board = await workspaceApi.getBoardByProject(currentProject.id);
                console.log(`[Diagnostic] Board fetch result:`, board ? `Found (ID: ${board.id})` : "Not Found (null)");
                if (board) {
                    const cols = await workspaceApi.getBoardColumns(board.id);
                    console.log(`[Diagnostic] Columns fetched: ${cols?.length || 0}`);
                    if (cols && cols.length > 0) {
                        const targetCol = cols.find(c => c.position === 1) || cols[0];
                        boardColumnId = targetCol.id;
                        console.log(`[Diagnostic] Successfully resolved column: ${targetCol.name} (id: ${targetCol.id}, position: ${targetCol.position})`);
                    } else {
                        console.warn("[Diagnostic] No columns found for board!");
                    }
                }
            } catch (e) {
                console.error("[Diagnostic] Column resolution failed with error:", e);
                console.warn("[CreateIssueModal] Falling back to constant BOARD_COLUMN_ID");
            }

            // 2. Resolve dynamic Epic
            const targetEpicUuid = ISSUE_CONSTANTS.ISSUE_TYPES.EPIC;
            const epicIssue = issues.find(i => (i as any).issueTypeId === targetEpicUuid || (i.issueType as string) === "EPIC");
            const epicId = epicIssue?.id || undefined;
            console.log(`[Diagnostic] Epic resolution:`, epicId ? `Found ${epicId}` : "Not Found (undefined)");

            // 3. Resolve dynamic Assignee (Default to self)
            const rawUserId = session?.user?.id || (session?.user as any)?.userId;
            console.log(`[Diagnostic] Session Raw User ID: "${rawUserId}"`);
            const assigneeId = (rawUserId && rawUserId !== "1") ? rawUserId : ISSUE_CONSTANTS.ASSIGNEE_ID;
            console.log(`[Diagnostic] Final Assignee ID: ${assigneeId} ${assigneeId === ISSUE_CONSTANTS.ASSIGNEE_ID ? "(FALLBACK USED)" : "(DYNAMIC USED)"}`);

            console.log(`[Diagnostic] Final Payload:`, {
                title,
                projectId: currentProject.id,
                boardColumnId,
                assigneeId,
                epicId
            });

            const newIssue = await workspaceApi.createIssue({
                title,
                description,
                priority: priority as any,
                projectId: currentProject.id,
                boardColumnId: boardColumnId,
                issueTypeId: typeId,
                epicId: epicId,
                assigneeId: assigneeId
            })
            addIssue(newIssue)
            setTitle("")
            setDescription("")
            setInviteEmail("")
            setIssueType("TASK")
            onClose()
        } catch (error) {
            console.error("Failed to create issue:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--background)] w-full max-w-2xl rounded-lg shadow-xl border border-[var(--border)] flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">Create issue</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded transition-colors text-[var(--foreground)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Issue Type</label>
                        <div className="flex items-center gap-3">
                            <IssueTypeIcon type={issueType} className="scale-125 ml-1" />
                            <select
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value as IssueType)}
                                className="flex-1 p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="TASK">Task</option>
                                <option value="STORY">Story</option>
                                <option value="BUG">Bug</option>
                                <option value="EPIC">Epic</option>
                                <option value="SUBTASK">Subtask</option>
                            </select>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Start typing to get a list of issue types.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Short Summary</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Describe the issue..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Assignee</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter email to assign/invite..."
                                className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-sm"
                            >
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2 text-[var(--foreground)]">
                    <button onClick={onClose} className="px-4 py-2 font-medium hover:bg-[var(--accent)] rounded transition-colors">Cancel</button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !title.trim()}
                        className="px-4 py-2 font-medium bg-[#0052cc] text-white hover:bg-blue-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Create
                    </button>
                </div>
            </div>
        </div>
    )
}

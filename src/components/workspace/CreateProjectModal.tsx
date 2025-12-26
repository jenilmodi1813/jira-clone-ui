import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { workspaceApi, CreateProjectRequest } from "@/features/workspace/api/workspace-api"

interface CreateProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onProjectCreated?: () => void
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
    const [name, setName] = useState("")
    const [projectKey, setProjectKey] = useState("")
    const [projectType, setProjectType] = useState<"KANBAN" | "SCRUM">("KANBAN")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Auto-generate key from name
    useEffect(() => {
        if (name) {
            const generatedKey = name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .substring(0, 10); // Max 10 chars
            setProjectKey(generatedKey)
        }
    }, [name])

    if (!isOpen) return null

    const handleCreate = async () => {
        if (!name.trim() || !projectKey.trim()) return

        if (projectKey.length > 10) {
            setError("Project Key must be 10 characters or less.")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const payload: CreateProjectRequest = {
                organizationId: "7ef1dab2-e0c7-4d73-8aad-d9f469044eda", // Hardcoded as requested
                name,
                projectKey,
                projectType,
                // leadId will be handled by the proxy/backend using the auth user
            }

            await workspaceApi.createProject(payload)

            // Success
            setName("")
            setProjectKey("")
            onClose()
            if (onProjectCreated) onProjectCreated()

            // Optional: Reload to refresh sidebar if global state isn't enough
            window.location.reload()

        } catch (err: any) {
            console.error("Failed to create project:", err)
            setError(err.message || "Failed to create project")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--background)] w-full max-w-lg rounded-lg shadow-xl border border-[var(--border)] flex flex-col">
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">Create Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded transition-colors text-[var(--foreground)]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. My New Project"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Project Key</label>
                        <input
                            type="text"
                            value={projectKey}
                            maxLength={10}
                            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                            className="w-full p-2 rounded border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                            placeholder="MYPROJ"
                        />
                        <p className="text-[10px] text-[var(--muted-foreground)]">Max 10 characters. Unique identifier for issues.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Template</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setProjectType("KANBAN")}
                                className={`flex-1 p-4 border rounded-lg text-left transition-colors ${projectType === "KANBAN" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-[var(--border)] hover:bg-[var(--accent)]"}`}
                            >
                                <div className="font-semibold text-sm mb-1 text-[var(--foreground)]">Kanban</div>
                                <div className="text-xs text-[var(--muted-foreground)]">Visualize work and maximize flow.</div>
                            </button>
                            <button
                                onClick={() => setProjectType("SCRUM")}
                                className={`flex-1 p-4 border rounded-lg text-left transition-colors ${projectType === "SCRUM" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-[var(--border)] hover:bg-[var(--accent)]"}`}
                            >
                                <div className="font-semibold text-sm mb-1 text-[var(--foreground)]">Scrum</div>
                                <div className="text-xs text-[var(--muted-foreground)]">Sprint towards your project goals.</div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2 text-[var(--foreground)]">
                    <button onClick={onClose} className="px-4 py-2 font-medium hover:bg-[var(--accent)] rounded transition-colors">Cancel</button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !name.trim() || !projectKey.trim()}
                        className="px-4 py-2 font-medium bg-[#0052cc] text-white hover:bg-blue-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    )
}

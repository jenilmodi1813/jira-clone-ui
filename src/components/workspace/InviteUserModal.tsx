"use client"
import { useState } from "react"
import { X, Loader2, UserPlus } from "lucide-react"
import { workspaceApi } from "@/features/workspace/api/workspace-api"

interface InviteUserModalProps {
    isOpen: boolean
    onClose: () => void
    orgId: string
    orgName: string
}

export function InviteUserModal({ isOpen, onClose, orgId, orgName }: InviteUserModalProps) {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleInvite = async () => {
        if (!email.trim()) return

        setIsSubmitting(true)
        setError("")
        setSuccess(false)

        try {
            await workspaceApi.inviteUser(orgId, email)
            setSuccess(true)
            setEmail("")
            // Close after a short delay
            setTimeout(() => {
                onClose()
                setSuccess(false)
            }, 2000)
        } catch (err: any) {
            console.error("Failed to invite user:", err)
            setError(err.message || "Failed to invite user")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus size={20} className="text-[#0052cc]" />
                        <h2 className="text-xl font-semibold text-[#172B4D]">Invite to {orgName}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
                            Invite sent successfully!
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-[#626F86]">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 bg-white text-[#172B4D] focus:ring-2 focus:ring-[#0052cc] outline-none"
                            placeholder="e.g. colleague@company.com"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                        />
                        <p className="text-xs text-[#626F86]">
                            They will receive an email to join your organization.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 font-medium hover:bg-gray-100 rounded transition-colors text-[#42526E]">Cancel</button>
                    <button
                        onClick={handleInvite}
                        disabled={isSubmitting || !email.trim() || success}
                        className="px-4 py-2 font-medium bg-[#0052cc] text-white hover:bg-blue-700 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {success ? "Sent!" : "Send Invite"}
                    </button>
                </div>
            </div>
        </div>
    )
}

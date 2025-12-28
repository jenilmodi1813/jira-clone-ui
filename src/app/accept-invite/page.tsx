"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, MoveRight, Building2, UserPlus, ShieldCheck } from "lucide-react"
import { JiraLogo } from "@/components/ui/jira-logo"
import { workspaceApi } from "@/features/workspace/api/workspace-api"
import { cn } from "@/lib/utils"

function InviteContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (!token) {
            setStatus("error")
            setMessage("Missing invitation token.")
        }
    }, [token])

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#0747A6] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
            </div>
        )
    }

    const handleAccept = async () => {
        if (!token) return

        setStatus("loading")
        try {
            await workspaceApi.acceptInvite(token)
            setStatus("success")
            setMessage("You have successfully joined the organization!")

            // Redirect after a short delay
            setTimeout(() => {
                router.push("/project/JIRA/board")
            }, 3000)
        } catch (err: any) {
            console.error("Accept invite error:", err)
            setStatus("error")
            setMessage(err.message || "Failed to accept the invitation. It may have expired or is invalid.")
        }
    }

    const handleReject = async () => {
        if (!token) return

        setStatus("loading")
        try {
            await workspaceApi.rejectInvite(token)
            setStatus("success")
            setMessage("Invitation declined.")

            setTimeout(() => {
                router.push("/sign-up")
            }, 3000)
        } catch (err: any) {
            console.error("Reject invite error:", err)
            setStatus("error")
            setMessage(err.message || "Failed to decline the invitation.")
        }
    }

    return (
        <div className="min-h-screen bg-[#0747A6] flex flex-col items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0052CC] rounded-full blur-[120px] opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2684FF] rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="bg-white p-3 rounded-xl shadow-2xl mb-4">
                        <JiraLogo className="w-12 h-12" />
                    </div>
                    <h1 className="text-white text-3xl font-bold tracking-tight">Jira Workspace</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-8">
                        {status === "loading" ? (
                            <div className="py-8 flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
                                    <div className="bg-blue-50 p-4 rounded-full relative">
                                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                    </div>
                                </div>
                                <h2 className="mt-6 text-xl font-semibold text-[#172B4D]">Processing your invitation</h2>
                                <p className="mt-2 text-[#626F86]">Connecting you to the organization...</p>
                            </div>
                        ) : status === "success" ? (
                            <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-green-50 p-4 rounded-full">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="mt-6 text-2xl font-bold text-[#172B4D]">Success!</h2>
                                <p className="mt-2 text-[#626F86] text-lg">{message}</p>
                                <div className="mt-8 flex items-center gap-2 text-blue-600 font-medium">
                                    <span>Taking you to your dashboard</span>
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-500">
                                {message === "Missing invitation token." ? (
                                    <div className="py-8 flex flex-col items-center text-center">
                                        <div className="bg-red-50 p-4 rounded-full">
                                            <XCircle className="w-12 h-12 text-red-500" />
                                        </div>
                                        <h2 className="mt-6 text-xl font-bold text-[#172B4D]">Invalid Link</h2>
                                        <p className="mt-2 text-[#626F86]">{message}</p>
                                        <button
                                            onClick={() => router.push("/sign-up")}
                                            className="mt-8 w-full py-3 bg-[#0052CC] text-white font-semibold rounded-lg hover:bg-[#0747A6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                        >
                                            Go to Sign Up
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                                <UserPlus size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-[#172B4D]">You've been invited</h2>
                                                <p className="text-[#626F86] text-sm">Join the team and start collaborating.</p>
                                            </div>
                                        </div>

                                        <div className="bg-[#FAFBFC] border border-[#EBECF0] rounded-xl p-5 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Building2 className="text-slate-400 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Organization</p>
                                                    <p className="font-semibold text-[#172B4D]">Invitation to Workspace</p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-[#EBECF0] w-full" />
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck className="text-slate-400 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Access Level</p>
                                                    <p className="font-semibold text-[#172B4D]">Full Member Access</p>
                                                </div>
                                            </div>
                                        </div>

                                        {message && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                                                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                <span>{message}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <button
                                                onClick={handleReject}
                                                className="py-3 px-4 border-2 border-[#DFE1E6] text-[#42526E] font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={handleAccept}
                                                className="py-3 px-4 bg-[#0052CC] text-white font-bold rounded-lg hover:bg-[#0747A6] transition-all shadow-[0_4px_14px_rgba(0,82,204,0.39)] transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                                            >
                                                <span>Join Team</span>
                                                <MoveRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-[#F4F5F7]/50 p-6 border-t border-[#EBECF0] text-center">
                        <p className="text-xs text-[#626F86]">
                            By joining, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* Bottom Links */}
                <div className="mt-8 flex justify-center gap-6 text-white/70 text-sm font-medium">
                    <a href="#" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Help Center</a>
                    <a href="#" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors underline decoration-white/30 underline-offset-4">Terms</a>
                </div>
            </div>
        </div>
    )
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0747A6] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
            </div>
        }>
            <InviteContent />
        </Suspense>
    )
}

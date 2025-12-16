"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { AuthCard } from "./auth-card"
import { Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { JiraLogo } from "@/components/ui/jira-logo"

export function SignInCard() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [step, setStep] = useState<"email" | "otp">("email")
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn("google")
        } catch (error) {
            setError("Something went wrong with Google Sign-in")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const emailInput = formData.get("email") as string

        if (!emailInput || !emailInput.includes("@")) {
            setError("Enter a valid email address")
            setIsLoading(false)
            return
        }

        // Mock sending OTP
        setTimeout(() => {
            setEmail(emailInput)
            setStep("otp")
            setIsLoading(false)
        }, 800)
    }

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0]
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const code = otp.join("")
        if (code.length !== 6) {
            setError("Please enter the 6-digit code")
            setIsLoading(false)
            return
        }

        // Verify Mock OTP (allow any 6 digit code for demo)
        const res = await signIn("credentials", {
            email,
            password: "dummy-password", // In real flow, this would be the OTP or magic link token
            redirect: false,
        })

        if (res?.error) {
            setError("Invalid code")
            setIsLoading(false)
        } else {
            window.location.href = "/project/JIRA/board"
        }
    }

    if (step === "otp") {
        return (
            <AuthCard error={error}>
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <JiraLogo className="w-10 h-10" />
                        <span className="text-4xl font-bold text-[#172b4d] tracking-tighter">Jira</span>
                    </div>
                    <h1 className="text-base font-bold text-[#172b4d]">Check your email</h1>
                </div>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-[#0052cc]" />
                        </div>
                    </div>
                    <p className="text-sm text-[#172b4d]">
                        We sent a specific verification code to <strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className="w-10 h-10 text-center text-lg font-bold border border-gray-300 rounded-[3px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-[#0052cc] hover:bg-[#0065ff] text-white font-bold h-[44px] rounded-[3px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify and login"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="w-full text-[#0052cc] text-sm hover:underline"
                    >
                        Go back
                    </button>

                    <div className="text-center">
                        <button type="button" className="text-sm text-[#0052cc] hover:underline">
                            Resend code
                        </button>
                    </div>
                </form>
            </AuthCard>
        )
    }

    return (
        <AuthCard error={error}>
            <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <JiraLogo className="w-10 h-10" />
                    <span className="text-4xl font-bold text-[#172b4d] tracking-tighter">Jira</span>
                </div>
                <h1 className="text-base font-bold text-[#172b4d]">Log in to continue</h1>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                    <input
                        name="email"
                        type="email"
                        required
                        autoFocus
                        placeholder="Enter your email"
                        className="w-full p-2 h-[44px] rounded-[3px] border border-gray-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-500"
                    />
                </div>

                <button
                    disabled={isLoading}
                    className="w-full bg-[#0052cc] hover:bg-[#0065ff] text-white font-bold h-[44px] rounded-[3px] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Continue"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <span className="text-xs text-[#5e6c84] px-2 uppercase font-semibold">Or continue with</span>
            </div>

            <div className="mt-4 space-y-3">
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-[40px] bg-white border border-gray-300 hover:bg-gray-50 text-[#172b4d] font-bold rounded-[3px] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                </button>
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-4 text-center">
                <Link href="/sign-up" className="text-[#0052cc] hover:underline text-sm">
                    Can't log in? • Sign up for an account
                </Link>
            </div>

            <div className="mt-6 text-center text-xs text-[#5e6c84] space-y-2">
                <p>One account for Jira, Confluence, Trello and more.</p>
                <p>
                    This site is protected by reCAPTCHA and the Google <a href="#" className="text-[#0052cc] hover:underline">Privacy Policy</a> and <a href="#" className="text-[#0052cc] hover:underline">Terms of Service</a> apply.
                </p>
            </div>

        </AuthCard>
    )
}

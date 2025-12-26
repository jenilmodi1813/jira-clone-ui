"use client"

import * as React from "react"
import { X, User, Mail, Globe, Camera, Loader2, Check } from "lucide-react"
import { userApi, UserProfileResponse } from "../api/user-api"
import { cn } from "@/lib/utils"

interface ProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [profile, setProfile] = React.useState<UserProfileResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [saving, setSaving] = React.useState<string | null>(null) // field name being saved

    const [editMode, setEditMode] = React.useState<{ [key: string]: boolean }>({})
    const [formData, setFormData] = React.useState({
        fullName: "",
        avatarUrl: "",
        timeZone: ""
    })

    React.useEffect(() => {
        if (isOpen) {
            fetchProfile()
        }
    }, [isOpen])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const data = await userApi.getMyProfile()
            setProfile(data)
            setFormData({
                fullName: data.fullName || "",
                avatarUrl: data.avatarUrl || "",
                timeZone: data.timeZone || "UTC"
            })
            setError(null)
        } catch (err) {
            setError("Failed to load profile")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (field: "fullName" | "avatarUrl" | "timeZone") => {
        setSaving(field)
        try {
            let updated: UserProfileResponse
            if (field === "fullName") {
                updated = await userApi.updateFullName({ fullName: formData.fullName })
            } else if (field === "avatarUrl") {
                updated = await userApi.updateAvatar({ avatarUrl: formData.avatarUrl })
            } else {
                updated = await userApi.updateTimeZone({ timeZone: formData.timeZone })
            }
            setProfile(updated)
            setEditMode(prev => ({ ...prev, [field]: false }))
        } catch (err) {
            setError(`Failed to update ${field}`)
        } finally {
            setSaving(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--background)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-gray-50/50">
                    <h2 className="text-xl font-bold text-[var(--foreground)]">User Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors text-[var(--muted-foreground)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-sm text-[var(--muted-foreground)]">Loading profile...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                            <button onClick={fetchProfile} className="ml-2 underline font-medium">Try again</button>
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center space-y-3">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt={profile.fullName || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            (profile.fullName?.[0] || profile.email?.[0] || "?").toUpperCase()
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setEditMode({ ...editMode, avatarUrl: !editMode.avatarUrl })}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                                {editMode.avatarUrl && (
                                    <div className="w-full space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Avatar URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.avatarUrl}
                                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                                className="flex-1 h-9 px-3 rounded-md border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="https://..."
                                            />
                                            <button
                                                onClick={() => handleUpdate("avatarUrl")}
                                                disabled={saving === "avatarUrl"}
                                                className="px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {saving === "avatarUrl" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Fields */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5">
                                        <User size={12} /> Full Name
                                    </label>
                                    <div className="group relative">
                                        {editMode.fullName ? (
                                            <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="flex-1 h-10 px-3 rounded-md border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                />
                                                <button
                                                    onClick={() => handleUpdate("fullName")}
                                                    disabled={saving === "fullName"}
                                                    className="px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {saving === "fullName" ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setEditMode({ ...editMode, fullName: true })}
                                                className="h-10 px-3 flex items-center justify-between rounded-md border border-transparent hover:border-[var(--border)] hover:bg-gray-50 cursor-pointer transition-all"
                                            >
                                                <span className={cn("text-sm font-medium", !profile.fullName && "text-[var(--muted-foreground)] italic")}>
                                                    {profile.fullName || "Click to set name"}
                                                </span>
                                                <button className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 font-medium">Edit</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5">
                                        <Mail size={12} /> Email Address
                                    </label>
                                    <div className="h-10 px-3 flex items-center rounded-md bg-gray-50 border border-transparent">
                                        <span className="text-sm text-[var(--muted-foreground)]">{profile.email}</span>
                                        <span className="ml-auto text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-[var(--muted-foreground)]">PRIMARY</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5">
                                        <Globe size={12} /> Timezone
                                    </label>
                                    <div className="group relative">
                                        {editMode.timeZone ? (
                                            <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                                                <select
                                                    value={formData.timeZone}
                                                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                                                    className="flex-1 h-10 px-3 rounded-md border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                >
                                                    <option value="UTC">UTC</option>
                                                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                                                    <option value="America/New_York">America/New_York</option>
                                                    <option value="Europe/London">Europe/London</option>
                                                </select>
                                                <button
                                                    onClick={() => handleUpdate("timeZone")}
                                                    disabled={saving === "timeZone"}
                                                    className="px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {saving === "timeZone" ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setEditMode({ ...editMode, timeZone: true })}
                                                className="h-10 px-3 flex items-center justify-between rounded-md border border-transparent hover:border-[var(--border)] hover:bg-gray-50 cursor-pointer transition-all"
                                            >
                                                <span className={cn("text-sm font-medium", !profile.timeZone && "text-[var(--muted-foreground)] italic")}>
                                                    {profile.timeZone || "Click to set timezone"}
                                                </span>
                                                <button className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 font-medium">Edit</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-[var(--border)] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

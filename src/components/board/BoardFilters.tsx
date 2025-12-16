"use client"

import { Search, UserPlus } from "lucide-react"

export function BoardFilters() {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                    type="text"
                    placeholder="Search this board"
                    className="h-8 pl-8 pr-4 rounded border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-40 hover:bg-[var(--accent)] transition-colors"
                />
            </div>

            <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 cursor-pointer hover:-translate-y-1 transition-transform">
                        U{i}
                    </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[var(--muted-foreground)] hover:bg-gray-200 cursor-pointer z-10">
                    <UserPlus size={14} />
                </div>
            </div>

            <div className="h-6 w-px bg-[var(--border)] mx-2" />

            <button className="text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] px-3 py-1.5 rounded transition-colors">
                Only my issues
            </button>
            <button className="text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] px-3 py-1.5 rounded transition-colors">
                Recently updated
            </button>
        </div>
    )
}

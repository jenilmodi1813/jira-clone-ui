"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export function AuthBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none opacity-40 blur-[2px] overflow-hidden select-none" aria-hidden="true">
            {/* Fake Sidebar */}
            <Sidebar className="!fixed !left-0 !top-0" />

            {/* Fake Header & Content Area */}
            <div className="pl-64 w-full h-full flex flex-col">
                <Header />
                <div className="mt-14 p-8 flex-1 bg-[var(--background)] overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 w-48 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-9 w-24 bg-blue-100 rounded"></div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="h-8 w-40 bg-gray-100 rounded"></div>
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white"></div>
                        </div>
                    </div>

                    <div className="flex gap-6 h-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-[280px] bg-[var(--secondary)] rounded-lg p-3 h-3/4 flex flex-col gap-3">
                                <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
                                <div className="h-24 bg-white rounded shadow-sm"></div>
                                <div className="h-24 bg-white rounded shadow-sm"></div>
                                <div className="h-24 bg-white rounded shadow-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

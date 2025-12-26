"use client"

import { SessionProvider } from "next-auth/react"
import { ProjectProvider } from "@/context/ProjectContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={10 * 60}>
            <ProjectProvider>
                {children}
            </ProjectProvider>
        </SessionProvider>
    )
}


import { ProjectHeader } from "@/components/project/ProjectHeader"

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full bg-white">
            <ProjectHeader />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

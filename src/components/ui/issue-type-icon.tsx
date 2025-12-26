import { Box, BookOpen, Bug, CheckSquare, Zap, GitMerge } from "lucide-react"
import { cn } from "@/lib/utils"

export type IssueType = "TASK" | "STORY" | "BUG" | "EPIC" | "SUBTASK"

interface IssueTypeIconProps {
    type?: IssueType | string
    className?: string
}

export function IssueTypeIcon({ type = "TASK", className }: IssueTypeIconProps) {
    switch (type) {
        case "STORY":
            return (
                <div className={cn("bg-[#36B37E] p-0.5 rounded-[2px] text-white", className)}>
                    <BookOpen size={10} strokeWidth={3} />
                </div>
            )
        case "BUG":
            return (
                <div className={cn("bg-[#FF5630] p-0.5 rounded-[2px] text-white", className)}>
                    <Bug size={10} strokeWidth={3} />
                </div>
            )
        case "EPIC":
            return (
                <div className={cn("bg-[#6554C0] p-0.5 rounded-[2px] text-white", className)}>
                    <Zap size={10} strokeWidth={3} />
                </div>
            )
        case "SUBTASK":
            return (
                <div className={cn("bg-[#4FA5C5] p-0.5 rounded-[2px] text-white", className)}>
                    <GitMerge size={10} strokeWidth={3} />
                </div>
            )
        case "TASK":
        default:
            return (
                <div className={cn("bg-[#4C9AFF] p-0.5 rounded-[2px] text-white", className)}>
                    <CheckSquare size={10} strokeWidth={3} />
                </div>
            )
    }
}

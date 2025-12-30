"use client"

import { useState, useMemo } from "react"
import { Search, MessageSquare, ListFilter, Check, MoreHorizontal, Info } from "lucide-react"
import { OrganizationMemberResponse } from "@/features/workspace/api/workspace-api"
import { cn } from "@/lib/utils"

interface BacklogFilterDropdownProps {
    isOpen: boolean
    onClose: () => void
    members: OrganizationMemberResponse[]
    selectedAssignees: string[]
    setSelectedAssignees: (ids: string[]) => void
    selectedPriorities: string[]
    setSelectedPriorities: (priorities: string[]) => void
    selectedStatuses: string[]
    setSelectedStatuses: (statuses: string[]) => void
}

type Category = "Parent" | "Assignee" | "Work type" | "Labels" | "Status" | "Priority"

export function BacklogFilterDropdown({
    isOpen,
    onClose,
    members,
    selectedAssignees,
    setSelectedAssignees,
    selectedPriorities,
    setSelectedPriorities,
    selectedStatuses,
    setSelectedStatuses
}: BacklogFilterDropdownProps) {
    const [activeCategory, setActiveCategory] = useState<Category>("Priority")
    const [categorySearchQuery, setCategorySearchQuery] = useState("")

    if (!isOpen) return null

    const categories: Category[] = ["Parent", "Assignee", "Work type", "Labels", "Status", "Priority"]

    const priorityOptions = [
        { id: "HIGHEST", label: "Highest", color: "#FF5630" },
        { id: "HIGH", label: "High", color: "#FF5630" },
        { id: "MEDIUM", label: "Medium", color: "#FFAB00" },
        { id: "LOW", label: "Low", color: "#36B37E" },
        { id: "LOWEST", label: "Lowest", color: "#36B37E" }
    ]

    const statusOptions = [
        { id: "TODO", label: "To Do" },
        { id: "IN_PROGRESS", label: "In Progress" },
        { id: "IN_REVIEW", label: "In Review" },
        { id: "IN_TESTING", label: "In Testing" },
        { id: "DONE", label: "Done" }
    ]

    const getOptions = () => {
        let options: { id: string; label: string; color?: string; avatar?: string | null }[] = []
        if (activeCategory === "Priority") {
            options = priorityOptions
        } else if (activeCategory === "Status") {
            options = statusOptions
        } else if (activeCategory === "Assignee") {
            options = members.map(m => ({ id: m.userId, label: m.displayName || m.email, avatar: m.avatarUrl }))
        }

        if (categorySearchQuery) {
            options = options.filter(o => o.label.toLowerCase().includes(categorySearchQuery.toLowerCase()))
        }
        return options
    }

    const toggleOption = (id: string) => {
        if (activeCategory === "Priority") {
            setSelectedPriorities(selectedPriorities.includes(id) ? selectedPriorities.filter(p => p !== id) : [...selectedPriorities, id])
        } else if (activeCategory === "Status") {
            setSelectedStatuses(selectedStatuses.includes(id) ? selectedStatuses.filter(s => s !== id) : [...selectedStatuses, id])
        } else if (activeCategory === "Assignee") {
            setSelectedAssignees(selectedAssignees.includes(id) ? selectedAssignees.filter(a => a !== id) : [...selectedAssignees, id])
        }
    }

    const isSelected = (id: string) => {
        if (activeCategory === "Priority") return selectedPriorities.includes(id)
        if (activeCategory === "Status") return selectedStatuses.includes(id)
        if (activeCategory === "Assignee") return selectedAssignees.includes(id)
        return false
    }

    return (
        <div className="absolute top-12 left-0 z-50 w-[550px] bg-white rounded-md shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-1 min-h-[400px]">
                {/* Sidebar */}
                <div className="w-[180px] bg-white border-r border-gray-100 py-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category)
                                setCategorySearchQuery("")
                            }}
                            className={cn(
                                "w-full px-4 py-2.5 text-left text-sm flex items-center justify-between group",
                                activeCategory === category
                                    ? "bg-[#E6EFFC] text-[#0052cc] border-l-[3px] border-[#0052cc] font-medium"
                                    : "text-[#44546F] hover:bg-gray-50 border-l-[3px] border-transparent"
                            )}
                        >
                            <span>{category}</span>
                            {category === "Parent" && <Info size={14} className="text-gray-400" />}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col">
                    <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={categorySearchQuery}
                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                            placeholder={`Search ${activeCategory.toLowerCase()}`}
                            className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-[3px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-0.5">
                        {getOptions().length > 0 ? (
                            getOptions().map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleOption(option.id)}
                                    className="w-full px-2 py-2 flex items-center gap-3 text-sm text-[#172B4D] hover:bg-gray-50 rounded-[3px] transition-colors text-left"
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded-[2px] border flex items-center justify-center transition-all",
                                        isSelected(option.id) ? "bg-[#0052cc] border-[#0052cc]" : "border-gray-300 bg-white"
                                    )}>
                                        {isSelected(option.id) && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="flex items-center gap-2 flex-1">
                                        {option.color && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 H-[2px]" style={{ backgroundColor: option.color, height: "2px" }} />
                                                <div className="w-3 H-[2px]" style={{ backgroundColor: option.color, height: "2px" }} />
                                            </div>
                                        )}
                                        {option.avatar && (
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                {option.label.charAt(0)}
                                            </div>
                                        )}
                                        <span>{option.label}</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10 text-sm text-gray-500">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-[#44546F]">
                <button className="flex items-center gap-2 text-xs font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors">
                    <MessageSquare size={14} />
                    Give feedback
                </button>
                <div className="text-xs">
                    Press <span className="bg-gray-100 px-1 py-0.5 border border-gray-200 rounded">Shift</span> + <span className="bg-gray-100 px-1 py-0.5 border border-gray-200 rounded">F</span> to open and close
                </div>
            </div>
        </div>
    )
}

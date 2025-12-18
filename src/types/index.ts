export type IssueStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "IN_TESTING" | "DONE"

export type Issue = {
    id: string
    title: string
    status: IssueStatus
    priority: "LOW" | "MEDIUM" | "HIGH"
    assignee?: {
        name: string
        avatar?: string
    }
}

export type ColumnType = {
    id: IssueStatus
    title: string
    issues: Issue[]
}

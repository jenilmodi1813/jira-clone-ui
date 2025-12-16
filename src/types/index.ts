export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE"

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

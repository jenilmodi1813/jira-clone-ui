export type IssueStatus = string;

export interface Issue {
    id: string;
    title: string;
    status: IssueStatus;
    priority: "LOW" | "MEDIUM" | "HIGH";
    issueType?: "TASK" | "STORY" | "BUG";
    boardColumnId?: string;
    projectId?: string;
    assigneeId?: string;
    reporterId?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    assignee?: {
        name: string;
        avatar?: string;
    };
}

export type ColumnType = {
    id: IssueStatus
    title: string
    issues: Issue[]
}

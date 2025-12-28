export interface OrganizationResponse {
    id: string;
    name: string;
}

export interface OrganizationMemberResponse {
    userId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    orgRole: string;
    jobTitle: string | null;
    department: string | null;
    joinedAt: string;
}

export interface ProjectResponse {
    id: string;
    name: string;
    projectKey: string;
    organizationId?: string;
    projectType?: string;
    leadId?: string;
}

import { Issue } from "@/types";

export interface BoardResponse {
    id: string;
    name: string;
    type: string;
    issues?: Issue[];
    columns?: { id: string; name: string }[];
}

// Hardcoded Constants for Create Issue
export const ISSUE_CONSTANTS = {
    PROJECT_ID: "52e5d090-ab95-45ef-afc2-76e10cbf00c2",
    BOARD_COLUMN_ID: "9f84560f-9ca4-46f6-a5d7-bbdb28c7ffd3",
    EPIC_ID: "de2e19b0-7646-4cdc-8ac8-c03da8d33826",
    ASSIGNEE_ID: "4b319107-4223-4528-ab9f-fd8738cfbeac",
    ISSUE_TYPES: {
        BUG: "93c7e466-e514-44e4-b09a-b4fbeb9c293c",
        EPIC: "908c23d9-9eef-4056-97b4-f7903cf9182c",
        STORY: "2561c38b-3951-4f39-822f-d39d6f31d7b2",
        TASK: "d7106028-9134-4915-9fc9-e2ed53102582",
        SUBTASK: "0259dae2-f389-46f0-b683-ac74128c98b5"
    }
}

export interface CreateIssueRequest {
    projectId: string;
    issueTypeId: string;
    boardColumnId?: string;
    epicId?: string;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    assigneeId?: string;
}

export interface CreateSubTaskRequest {
    title: string;
    description: string;
    assigneeId: string;
    priority: string;
}

export const workspaceApi = {
    getOrganizations: async (): Promise<OrganizationResponse[]> => {
        const response = await fetch("/api/organizations/my");
        if (!response.ok) throw new Error("Failed to fetch organizations");
        return response.json();
    },

    getProjectsByOrg: async (orgId: string): Promise<ProjectResponse[]> => {
        const response = await fetch(`/api/projects/org/${orgId}`);
        if (!response.ok) throw new Error(`Failed to fetch projects for org ${orgId}`);
        return response.json();
    },

    getBoardByProject: async (projectId: string): Promise<BoardResponse | null> => {
        const response = await fetch(`/api/boards/project/${projectId}`);
        if (!response.ok) {
            console.warn(`[workspaceApi] No board found for project ${projectId}`);
            return null;
        }
        const data = await response.json();
        return data;
    },

    getIssuesByProject: async (projectId: string): Promise<Issue[]> => {
        const response = await fetch(`/api/issues/project/${projectId}`);
        if (!response.ok) throw new Error(`Failed to fetch issues for project ${projectId}`);
        const data = await response.json();
        console.log(`[workspaceApi] Fetched ${data.length} issues for project ${projectId}:`, data);
        return data;
    },

    getOrganizationMembers: async (orgId: string): Promise<OrganizationMemberResponse[]> => {
        const response = await fetch(`/api/organizations/${orgId}/members`);
        if (!response.ok) throw new Error(`Failed to fetch members for organization ${orgId}`);
        return response.json();
    },

    getIssueById: async (id: string): Promise<Issue> => {
        const response = await fetch(`/api/issues/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch issue detail for ${id}`);
        return response.json();
    },

    getProfileById: async (userId: string): Promise<{ fullName?: string, name?: string, id: string }> => {
        const response = await fetch(`/api/users/profile/by-id/${userId}`);
        if (!response.ok) throw new Error(`Failed to fetch profile for ${userId}`);
        return response.json();
    },

    createBoard: async (board: CreateBoardRequest): Promise<BoardResponse> => {
        console.log("workspaceApi.createBoard called with:", board)
        const response = await fetch("/api/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(board),
        });
        if (!response.ok) throw new Error("Failed to create board");
        return response.json();
    },

    createIssue: async (issue: CreateIssueRequest): Promise<Issue> => {
        console.log("workspaceApi.createIssue called with:", issue)
        const response = await fetch("/api/issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(issue),
        });
        if (!response.ok) throw new Error("Failed to create issue");
        return response.json();
    },

    updateIssue: async (id: string, issue: Partial<Issue>): Promise<Issue> => {
        const response = await fetch(`/api/issues/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(issue),
        });
        if (!response.ok) throw new Error("Failed to update issue");
        return response.json();
    },

    deleteIssue: async (id: string): Promise<void> => {
        const response = await fetch(`/api/issues/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete issue");
    },

    createSubTask: async (parentId: string, subTask: CreateSubTaskRequest): Promise<Issue> => {
        const response = await fetch(`/api/issues/${parentId}/subtasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subTask),
        });
        if (!response.ok) throw new Error("Failed to create subtask");
        return response.json();
    },

    inviteUser: async (orgId: string, email: string): Promise<void> => {
        const response = await fetch(`/api/organizations/${orgId}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            let errorMessage = "Failed to invite user";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // If not JSON, try text
            }
            throw new Error(errorMessage);
        }
    },

    createProject: async (project: CreateProjectRequest): Promise<ProjectResponse> => {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project),
        });
        if (!response.ok) throw new Error("Failed to create project");
        return response.json();
    },

    getMyProjects: async (): Promise<ProjectResponse[]> => {
        const response = await fetch("/api/projects/my");
        if (!response.ok) throw new Error("Failed to fetch my projects");
        return response.json();
    },

    getBoardColumns: async (boardId: string): Promise<BoardColumnResponse[]> => {
        const response = await fetch(`/api/boards/${boardId}/columns`);
        if (!response.ok) throw new Error(`Failed to fetch columns for board ${boardId}`);
        return response.json();
    },

    moveIssue: async (issueId: string, columnId: string): Promise<Issue> => {
        const response = await fetch(`/api/issues/${issueId}/move`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ columnId }),
        });
        if (!response.ok) throw new Error(`Failed to move issue ${issueId}`);
        return response.json();
    },

    acceptInvite: async (token: string): Promise<void> => {
        const response = await fetch(`/api/organizations/invites/accept?token=${token}`, {
            method: "POST",
        });
        if (!response.ok) {
            let errorMessage = "Failed to accept invite";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Not JSON
            }
            throw new Error(errorMessage);
        }
    },

    rejectInvite: async (token: string): Promise<void> => {
        const response = await fetch(`/api/organizations/invites/reject?token=${token}`, {
            method: "POST",
        });
        if (!response.ok) {
            let errorMessage = "Failed to reject invite";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // Not JSON
            }
            throw new Error(errorMessage);
        }
    }
};

export interface CreateBoardRequest {
    projectId: string;
    name: string;
    type: "KANBAN" | "SCRUM";
}

export interface BoardColumnResponse {
    id: string;
    name: string;
    position: number;
    boardId: string;
}

export interface CreateProjectRequest {
    organizationId: string;
    name: string;
    projectKey: string;
    projectType: "KANBAN" | "SCRUM";
    leadId?: string; // Optional here as backend might resolve it, but we'll try to pass if needed or rely on backend
}

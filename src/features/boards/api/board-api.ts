export interface CreateBoardRequest {
    name: string;
    type: string;
}

export interface BoardResponse {
    id: string;
    name: string;
    type: string;
    projectId: string;
}

const API_URL = "/api/boards";

async function handleErrorResponse(response: Response, defaultMessage: string) {
    const errorText = await response.text();
    console.error(`${defaultMessage} API Error:`, response.status, errorText);
    throw new Error(errorText || defaultMessage);
}

export const boardApi = {
    createBoard: async (request: CreateBoardRequest): Promise<BoardResponse> => {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Create Board");
        }

        return response.json();
    },
};

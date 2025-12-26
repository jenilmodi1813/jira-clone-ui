export interface UserProfileResponse {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
    timeZone: string;
}

export interface UpdateFullNameRequest {
    fullName: string;
}

export interface UpdateAvatarRequest {
    avatarUrl: string;
}

export interface UpdateTimeZoneRequest {
    timeZone: string;
}

const API_URL = "/api/users/profile";

async function handleErrorResponse(response: Response, defaultMessage: string) {
    const errorText = await response.text();
    console.error(`${defaultMessage} API Error:`, response.status, errorText);

    try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
            throw new Error(errorJson.message);
        }
    } catch (e) {
        // ignore parse errors
    }

    throw new Error(errorText || defaultMessage);
}

export const userApi = {
    getMyProfile: async (): Promise<UserProfileResponse> => {
        const response = await fetch(`${API_URL}/me`);
        if (!response.ok) {
            await handleErrorResponse(response, "Get Profile");
        }
        return response.json();
    },

    updateFullName: async (request: UpdateFullNameRequest): Promise<UserProfileResponse> => {
        const response = await fetch(`${API_URL}/full-name`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Update Full Name");
        }
        return response.json();
    },

    updateAvatar: async (request: UpdateAvatarRequest): Promise<UserProfileResponse> => {
        const response = await fetch(`${API_URL}/avatar`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Update Avatar");
        }
        return response.json();
    },

    updateTimeZone: async (request: UpdateTimeZoneRequest): Promise<UserProfileResponse> => {
        const response = await fetch(`${API_URL}/timezone`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            await handleErrorResponse(response, "Update Timezone");
        }
        return response.json();
    },
};

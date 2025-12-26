export interface SignupRequest {
    email: string;
}

export interface VerifyEmailRequest {
    email: string;
    verificationCode: string;
}

export interface LoginRequest {
    email: string;
}

const API_URL = "/api";

async function handleErrorResponse(response: Response, defaultMessage: string) {
    const errorText = await response.text();
    console.error(`${defaultMessage} API Error:`, response.status, errorText);

    try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
            throw new Error(errorJson.message);
        }
    } catch (e) {
        if (e instanceof Error && e.message !== "Unexpected token 'u', \"unauthorize\"... is not valid JSON") {
            // If it's our thrown error, rethrow it
            if (errorText.includes('"message":')) throw e;
        }
    }

    throw new Error(errorText || defaultMessage);
}

export const authService = {
    login: async (request: LoginRequest): Promise<void> => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Login");
        }
    },

    signup: async (request: SignupRequest): Promise<void> => {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Signup");
        }
    },

    verifyEmail: async (request: VerifyEmailRequest): Promise<void> => {
        const response = await fetch(`${API_URL}/verify-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: request.email, otp: request.verificationCode }),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Verify Email");
        }
    },

    verifyLogin: async (request: VerifyEmailRequest): Promise<any> => {
        const response = await fetch(`${API_URL}/verify-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: request.email, otp: request.verificationCode }),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Verify Login");
        }
        return response.json();
    },

    refreshToken: async (refreshToken: string): Promise<any> => {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            await handleErrorResponse(response, "Refresh Token");
        }
        return response.json();
    },
};

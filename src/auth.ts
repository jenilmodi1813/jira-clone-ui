import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || "secret_for_dev_only",
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                token: { label: "Token", type: "text" },
            },
            authorize: async (credentials) => {
                const schema = z.object({
                    email: z.string().email(),
                    password: z.string().min(1),
                    token: z.string().optional(),
                    refreshToken: z.string().optional(),
                })

                const validatedFields = schema.safeParse(credentials)

                if (validatedFields.success) {
                    const { email, token, refreshToken } = validatedFields.data;
                    try {
                        // Fetch the real profile from the backend
                        const response = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`);
                        if (response.ok) {
                            const profile = await response.json();
                            console.log("[Auth] Profile Data from backend:", JSON.stringify(profile));
                            const extractedId = profile.id || profile.userId || profile.uuid || profile.sub;
                            return {
                                id: extractedId || "1",
                                name: profile.fullName || "User",
                                email: profile.email,
                                image: profile.avatarUrl || `https://avatar.vercel.sh/${profile.fullName?.charAt(0) || 'u'}`,
                                accessToken: token,
                                refreshToken: refreshToken,
                            }
                        }
                    } catch (error) {
                        console.error("Auth Fetch Profile Error:", error);
                    }

                    // Fallback for dev if backend is down or user not found
                    return {
                        id: "1",
                        name: "Jenil User",
                        email: validatedFields.data.email,
                        image: "https://avatar.vercel.sh/j",
                        accessToken: token,
                        refreshToken: refreshToken,
                    }
                }

                return null
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Helper to parse JWT
            const parseJwt = (t: string) => {
                try {
                    return JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString());
                } catch (e) {
                    console.error("[Auth JWT] Parse Error:", e);
                    return null;
                }
            }

            // Initial sign in
            if (user) {
                console.log("[Auth JWT] Initial Sign In for:", user.email);
                token.id = user.id;
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;

                if (token.accessToken) {
                    const decoded = parseJwt(token.accessToken as string);
                    if (decoded?.exp) {
                        token.accessTokenExpires = decoded.exp * 1000 - 600000; // 10 minute buffer
                        console.log("[Auth JWT] Token exp (with 10m buffer):", new Date(token.accessTokenExpires as number).toLocaleString());
                    } else {
                        token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
                    }
                }
            }

            const now = Date.now();
            const expiresAt = (token.accessTokenExpires as number) || 0;

            // If token is still valid (including the 10m buffer), return it
            if (now < expiresAt) {
                return token;
            }

            // Access token has expired, try to update it
            console.log("[Auth JWT] TOKEN NEAR EXPIRY or EXPIRED. Attempting refresh...");
            if (!token.refreshToken) {
                console.error("[Auth JWT] No refreshToken! Forced logout may occur.");
                return { ...token, error: "MissingRefreshTokenError" };
            }

            try {
                const rt = token.refreshToken as string;
                console.log("[Auth JWT] Refreshing with token:", rt ? rt.substring(0, 10) + "..." : "missing");
                const response = await fetch("http://localhost:8081/api/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken: token.refreshToken }),
                });

                if (!response.ok) {
                    const err = await response.text();
                    console.error("[Auth JWT] Refresh Failed:", response.status, err);
                    throw new Error("Failed to refresh token");
                }

                const refreshedTokens = await response.json();
                console.log("[Auth JWT] Successfully refreshed tokens.");

                const newAccessToken = refreshedTokens.token || refreshedTokens.accessToken;
                const decoded = parseJwt(newAccessToken);
                // 10 minute buffer for the new token too
                const newExpires = decoded?.exp ? (decoded.exp * 1000 - 600000) : (Date.now() + 60 * 60 * 1000);

                return {
                    ...token,
                    accessToken: newAccessToken,
                    accessTokenExpires: newExpires,
                    refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
                }
            } catch (error) {
                console.error("[Auth JWT] Refresh Exception:", error);
                return { ...token, error: "RefreshAccessTokenError" }
            }
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session as any).accessToken = token.accessToken;
                (session as any).error = token.error;
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/project') || nextUrl.pathname === '/'
            const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/sign-up')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false
            } else if (isOnAuth) {
                if (isLoggedIn) return Response.redirect(new URL('/project/JIRA/board', nextUrl))
                return true
            }

            return true
        }
    }
})

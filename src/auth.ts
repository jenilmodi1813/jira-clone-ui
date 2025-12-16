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
            },
            authorize: async (credentials) => {
                const schema = z.object({
                    email: z.string().email(),
                    password: z.string().min(1),
                })

                const validatedFields = schema.safeParse(credentials)

                if (validatedFields.success) {
                    return {
                        id: "1",
                        name: "Jenil User",
                        email: validatedFields.data.email,
                        image: "https://avatar.vercel.sh/j",
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

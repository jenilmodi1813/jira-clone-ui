import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session as any).accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return new NextResponse("Token is required", { status: 400 });
        }

        let userId = session.user?.id;
        const email = session.user?.email;
        const accessToken = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        // Resolve userId if it's not a real UUID (pattern from other routes)
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                        "X-User-Email": email || "",
                        "Cookie": cookieHeader,
                    }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    userId = profile.id || profile.userId || profile.uuid;
                }
            } catch (e) {
                console.warn("[Accept Invite Proxy] Failed to fetch real user ID:", e);
            }
        }

        if (!userId || userId === "1") {
            userId = "4b319107-4223-4528-ab9f-fd8738cfbeac"; // Fallback from other routes
        }

        // Proxy to backend
        const response = await fetch(`http://localhost:8080/api/organizations/invites/accept?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Accept invite failed:", response.status, errorText);

            // Try to parse JSON to return a structured error if possible
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: response.status });
            } catch (e) {
                return new NextResponse(errorText, { status: response.status });
            }
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[API] Accept invite proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

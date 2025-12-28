import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session as any).accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { orgId } = await params;
        const accessToken = (session as any).accessToken;
        const email = session.user?.email;
        let userId = session.user?.id;
        const cookieHeader = req.headers.get("cookie") || "";

        // Resolve userId if needed (pattern from other routes)
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
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
                console.warn("[Members Proxy] Failed to fetch real user ID:", e);
            }
        }

        if (!userId || userId === "1") {
            userId = "4b319107-4223-4528-ab9f-fd8738cfbeac"; // Fallback
        }

        // Proxy to backend
        const response = await fetch(`http://localhost:8084/api/organizations/${orgId}/members`, {
            method: "GET",
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
            console.error("[API] Get members failed:", response.status, errorText);
            return new NextResponse(errorText, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] Members proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

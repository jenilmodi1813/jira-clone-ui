import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
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
        const body = await req.json();

        let userId = session.user?.id;
        const email = session.user?.email;
        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        // Fallback for real UUID if default ID
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "X-User-Email": email || "",
                        "Cookie": cookieHeader,
                    }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    console.log("[Invite Proxy] Profile contents:", JSON.stringify(profile));

                    userId = profile.id || profile.userId || profile.uuid;

                    if (!userId || userId === "1") {
                        console.warn("[Invite Proxy] Could not resolve valid UUID, using fallback.");
                        userId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
                    }
                    console.log(`[Invite Proxy] Final Resolved userId: ${userId}`);
                }
            } catch (e) {
                console.warn("[Invite Proxy] Failed to fetch real user ID:", e);
            }
        }

        // Proxy to backend (Port 8084 as requested)
        const response = await fetch(`http://localhost:8084/api/organizations/${orgId}/invite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Invite failed:", response.status, errorText);
            return new NextResponse(errorText, { status: response.status });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[API] Invite proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

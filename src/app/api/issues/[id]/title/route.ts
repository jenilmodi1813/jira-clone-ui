import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { id } = await params;
        const body = await req.json();

        let userId = session.user.id;
        let email = session.user.email;
        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        // Fallback for real UUID if "1"
        if ((!userId || userId === "1") && email) {
            const profileRes = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                    "X-User-Email": email || "",
                    "Cookie": cookieHeader,
                }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                userId = profile.id || profile.userId || profile.uuid || profile.sub || userId;
            }
        }

        // Backend Endpoint: PATCH http://localhost:8087/api/issues/{id}/title
        const response = await fetch(`http://localhost:8087/api/issues/${id}/title`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            return new NextResponse(error || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Update Issue Title Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

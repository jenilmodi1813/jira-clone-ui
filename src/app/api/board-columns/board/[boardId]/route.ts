import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { boardId } = await params;
        let userId = session.user.id;
        let email = session.user.email;

        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        // Fallback for real UUID if "1"
        if ((!userId || userId === "1") && email) {
            const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
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

        const response = await fetch(`http://localhost:8080/api/board-columns/board/${boardId}`, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            return new NextResponse(error || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Board Columns Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

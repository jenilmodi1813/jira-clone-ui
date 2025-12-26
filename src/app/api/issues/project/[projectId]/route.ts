import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;
    console.log(`[Issue Proxy] GET issues for projectId: ${projectId}`);

    if (!projectId || projectId === "undefined") {
        console.error("[Issue Proxy] ERROR: projectId is undefined");
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    try {
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

        const response = await fetch(`http://localhost:8087/api/issues/project/${projectId}`, {
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
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Issue Proxy] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Issue Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

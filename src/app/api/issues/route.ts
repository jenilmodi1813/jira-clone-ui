import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
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

        if (body.assigneeId === "1") body.assigneeId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
        if (body.reporterId === "1") body.reporterId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
        const response = await fetch(`http://localhost:8080/api/issues`, {
            method: "POST",
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
        console.error("Create Issue Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    // We can handle generic PUT if it has /[id] but the file is at /api/issues/route.ts
    // For specific id updates, we should probably have /api/issues/[id]/route.ts
    return new NextResponse("Method not allowed", { status: 405 });
}

export async function DELETE(req: Request) {
    return new NextResponse("Method not allowed", { status: 405 });
}

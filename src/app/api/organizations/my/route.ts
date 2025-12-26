import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        let userId = session.user.id;
        const email = session.user.email;

        // Fallback for real UUID
        if ((!userId || userId === "1") && email) {
            const profileRes = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                headers: { "Content-Type": "application/json" }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                userId = profile.id || profile.userId || profile.uuid || userId;
            }
        }

        const token = (session as any).accessToken;

        const response = await fetch("http://localhost:8084/api/organizations/my", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy Org] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Organization Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

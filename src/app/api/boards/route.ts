import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const token = (session as any).accessToken;
        let userId = session.user.id;
        const email = session.user.email;
        const cookieHeader = req.headers.get("cookie") || "";

        // Fallback for real UUID if default ID
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8083/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                    headers: { "Content-Type": "application/json" }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    userId = profile.id || profile.userId || profile.uuid;
                    if (!userId || userId === "1") {
                        userId = "4b319107-4223-4528-ab9f-fd8738cfbeac"; // Fallback
                    }
                }
            } catch (e) {
                console.warn("[Board Proxy] Failed to fetch real user ID:", e);
            }
        }

        console.log(`[Board Proxy] Creating board for user: ${email} (ID: ${userId})`);

        const response = await fetch("http://localhost:8086/api/boards", {
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
            const errorText = await response.text();
            console.error(`[Board Proxy] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Board Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

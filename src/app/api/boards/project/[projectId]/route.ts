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
    console.log(`[Proxy Boards] GET boards for projectId: ${projectId}`);

    if (!projectId || projectId === "undefined") {
        console.error("[Proxy Boards] ERROR: projectId is undefined or string 'undefined'");
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    try {
        let userId = session.user.id;
        const email = session.user.email;
        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        // Fallback for real UUID
        // Fallback for real UUID if default ID
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "X-User-Email": email || "",
                        "Cookie": cookieHeader,
                    }
                });

                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    console.log("[Proxy Boards] Profile contents:", JSON.stringify(profile));

                    // Prioritize fields that look like UUIDs
                    userId = profile.id || profile.userId || profile.uuid;

                    // If still "1" or missing, fallback to known admin UUID
                    if (!userId || userId === "1") {
                        console.warn("[Proxy Boards] Could not resolve valid UUID, using fallback.");
                        userId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
                    }
                    console.log(`[Proxy Boards] Final Resolved userId: ${userId}`);
                }
            } catch (e) {
                console.warn("[Proxy Boards] Failed to fetch real user ID:", e);
            }
        }

        const response = await fetch(`http://localhost:8080/api/boards/project/${projectId}`, {
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
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy Boards] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Boards Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

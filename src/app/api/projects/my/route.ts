import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session as any).accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        let userId = session.user?.id;
        const email = session.user?.email;

        // Fallback for real UUID if default ID
        if ((!userId || userId === "1") && email) {
            try {
                const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                    headers: { "Content-Type": "application/json" }
                });

                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    console.log("[My Projects Proxy] Profile contents:", JSON.stringify(profile));

                    // Prioritize fields that look like UUIDs
                    userId = profile.id || profile.userId || profile.uuid;

                    // If still "1" or missing, fallback to known admin UUID
                    if (!userId || userId === "1") {
                        console.warn("[My Projects Proxy] Could not resolve valid UUID from profile, using fallback.");
                        userId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
                    }

                    console.log(`[My Projects Proxy] Final Resolved userId: ${userId}`);
                }
            } catch (e) {
                console.warn("[My Projects Proxy] Failed to fetch real user ID:", e);
            }
        }

        const token = (session as any).accessToken;

        // Proxy to backend (Port 8085 as requested)
        const response = await fetch("http://localhost:8080/api/projects/my", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Get My Projects failed:", response.status, errorText);
            return new NextResponse(errorText, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] Get My Projects proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

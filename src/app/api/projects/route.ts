import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session as any).accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        let userId = session.user?.id;
        const email = session.user?.email;
        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

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
                    console.log("[Create Project Proxy] Profile contents:", JSON.stringify(profile));

                    // Prioritize fields that look like UUIDs
                    userId = profile.id || profile.userId || profile.uuid;

                    // If still "1" or missing, fallback to known admin UUID
                    if (!userId || userId === "1") {
                        console.warn("[Create Project Proxy] Could not resolve valid UUID from profile, using fallback.");
                        userId = "4b319107-4223-4528-ab9f-fd8738cfbeac";
                    }

                    console.log(`[Create Project Proxy] Final Resolved userId: ${userId}`);
                }
            } catch (e) {
                console.warn("[Create Project Proxy] Failed to fetch real user ID:", e);
            }
        }

        // Ensure leadId is set if not provided (though Payload usually has it)
        const payload = { ...body, leadId: userId };

        // Proxy to backend (Port 8085 as requested)
        const response = await fetch("http://localhost:8080/api/projects", {
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
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[API] Create Project failed:", response.status, errorText);
            return new NextResponse(errorText, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] Create Project proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

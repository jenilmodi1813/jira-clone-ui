import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        let userId = session.user.id;
        let email = session.user.email;

        console.log(`[Proxy] Updating Full Name for user: ${email} (current id: ${userId})`);

        // If we have a dummy ID, missing ID, or "1", try to get the real one
        if ((!userId || userId === "1") && email) {
            console.log(`[Proxy] Missing real UUID, attempting fetch for ${email}`);
            const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                headers: { "Content-Type": "application/json" }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                console.log("[Proxy] Profile Keys:", Object.keys(profile));
                console.log("[Proxy] Full Profile:", JSON.stringify(profile));
                userId = profile.id || profile.userId || profile.uuid || profile.sub || userId; // Keep existing if all fail
                console.log(`[Proxy] Current userId after extraction: ${userId}`);
            } else {
                const errText = await profileRes.text();
                console.error(`[Proxy] Failed to fetch profile by email: ${profileRes.status} ${errText}`);
            }
        }

        if (!userId) {
            console.error("[Proxy] No User ID found even after fallback.");
            return new NextResponse("User ID not found", { status: 400 });
        }

        // Get cookies from the incoming request to forward
        const cookieHeader = req.headers.get("cookie") || "";
        const token = (session as any).accessToken;

        if (!token) {
            console.error("[Proxy Profile/FullName] Access token MISSING from session.");
            return NextResponse.json({ error: "Access token missing. Please log out and back in." }, { status: 401 });
        }

        const response = await fetch("http://localhost:8080/api/users/profile/full-name", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Auth-User-Id": userId,
                "authUserId": userId,
                "X-User-Id": userId,
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
                "Origin": "http://localhost:3000",
                "Referer": "http://localhost:3000/",
                "Cookie": cookieHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy Profile/FullName] Backend Error ${response.status}: ${errorText}`);

            if (response.status === 401) {
                return NextResponse.json({
                    error: "Backend session expired. Please re-login.",
                    details: errorText
                }, { status: 401 });
            }

            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Profile Name Update Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

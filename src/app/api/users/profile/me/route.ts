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

        // If we have a dummy ID, missing ID, or "1", try to get the real one
        if ((!userId || userId === "1") && email) {
            console.log(`[Proxy Profile/Me] Missing real UUID, attempting fetch for ${email}`);
            const profileRes = await fetch(`http://localhost:8080/api/users/profile/find-by-email?email=${encodeURIComponent(email)}`, {
                headers: { "Content-Type": "application/json" }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                userId = profile.id || profile.userId || profile.uuid || profile.sub || userId;
                console.log(`[Proxy Profile/Me] Current userId after extraction: ${userId}`);
            }
        }

        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        if (!token) {
            console.error("[Proxy Profile/Me] Access token MISSING from session.");
            return NextResponse.json({ error: "Access token missing. Please log out and back in." }, { status: 401 });
        }

        console.log(`[Proxy Profile/Me] Forwarding to 8083 with token and ID: ${userId}`);

        const response = await fetch("http://localhost:8080/api/users/profile/me", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-Auth-User-Id": userId || "",
                "authUserId": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "User-Agent": req.headers.get("user-agent") || "Mozilla/5.0",
                "Cookie": cookieHeader,
            },
        });

        console.log(`[Proxy Profile/Me] Backend Response Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy Profile/Me] Backend Error ${response.status}: ${errorText}`);

            if (response.status === 401) {
                return NextResponse.json({
                    error: "Backend session expired. Please re-login.",
                    details: errorText,
                    timestamp: new Date().toISOString(),
                    tokenRef: token ? `${token.substring(0, 10)}...` : "none",
                    hint: "Try logging out and back in to refresh all tokens."
                }, { status: 401 });
            }

            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Profile Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    console.log(`[Issue Detail Proxy] GET issue for id: ${id}`);

    if (!id || id === "undefined") {
        return NextResponse.json({ error: "Invalid issue ID" }, { status: 400 });
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

        const response = await fetch(`http://localhost:8087/api/issues/${id}`, {
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
            console.error(`[Issue Detail Proxy] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Issue Detail Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    try {
        const body = await req.json();
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

        const response = await fetch(`http://localhost:8087/api/issues/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
                "X-Auth-User-Id": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) return new NextResponse(await response.text(), { status: response.status });
        return NextResponse.json(await response.json());
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
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

        const response = await fetch(`http://localhost:8087/api/issues/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "X-Auth-User-Id": userId || "",
                "X-User-Id": userId || "",
                "X-User-Email": email || "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
        });

        if (!response.ok) return new NextResponse(await response.text(), { status: response.status });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

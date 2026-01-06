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
    console.log(`[User Proxy] GET profile for id: ${id}`);

    if (!id || id === "1" || id === "undefined") {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    try {
        const token = (session as any).accessToken;
        const cookieHeader = req.headers.get("cookie") || "";

        const response = await fetch(`http://localhost:8080/api/users/profile/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
                "X-User-Roles": "USER,ADMIN",
                "Cookie": cookieHeader,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[User Proxy] Backend Error ${response.status}: ${errorText}`);
            return new NextResponse(errorText || "Backend error", { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("User Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    try {
        const body = await req.json();
        const token = (session as any).accessToken;
        const response = await fetch(`http://localhost:8080/api/issues/${id}/subtasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
                "X-User-Roles": "USER,ADMIN",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) return new NextResponse(await response.text(), { status: response.status });
        return NextResponse.json(await response.json());
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

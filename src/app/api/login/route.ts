import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const response = await fetch("http://localhost:8081/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "http://localhost:8081",
                "Referer": "http://localhost:8081/",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(errorText || "Backend returned " + response.status, { status: response.status });
        }

        const data = await response.json().catch(() => null);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Login Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

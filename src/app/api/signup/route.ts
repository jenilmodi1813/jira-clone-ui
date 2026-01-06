import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const response = await fetch("http://localhost:8080/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Origin": "http://localhost:8080",
                "Referer": "http://localhost:8080/",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(errorText || "Backend returned " + response.status, { status: response.status });
        }

        return new NextResponse(null, { status: 201 });
    } catch (error) {
        console.error("Signup Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const validUsername = process.env.USERNAME;
        const validPassword = process.env.PASSWORD;

        if (username !== validUsername || password !== validPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = await signToken(username);

        const response = NextResponse.json({ success: true });

        // Set HTTP-Only cookie with 100 year expiry
        response.cookies.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 100 * 365 * 24 * 60 * 60, // 100 years
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

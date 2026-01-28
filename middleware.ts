import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth-token";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /dashboard routes
    if (pathname.startsWith("/dashboard")) {
        const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || "default-secret"
            );
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch {
            // Token invalid or expired
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete(AUTH_COOKIE_NAME);
            return response;
        }
    }

    // Redirect root to dashboard if authenticated, otherwise to login
    if (pathname === "/") {
        const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

        if (token) {
            try {
                const secret = new TextEncoder().encode(
                    process.env.JWT_SECRET || "default-secret"
                );
                await jwtVerify(token, secret);
                return NextResponse.redirect(new URL("/dashboard", request.url));
            } catch {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/dashboard/:path*"],
};

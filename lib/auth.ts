import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const secret = new TextEncoder().encode(JWT_SECRET);

// Token expires in 100 years
const EXPIRY_TIME = 100 * 365 * 24 * 60 * 60; // 100 years in seconds

export async function signToken(username: string): Promise<string> {
    const token = await new SignJWT({ username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${EXPIRY_TIME}s`)
        .sign(secret);

    return token;
}

export async function verifyToken(
    token: string
): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

export const AUTH_COOKIE_NAME = "auth-token";

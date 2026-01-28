import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
    // Check authentication
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token || !(await verifyToken(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const keys = await redis.keys("used-codes:*");
        const data: Record<string, number[]> = {};

        for (const key of keys) {
            const email = key.replace("used-codes:", "");
            const indexes = await redis.get<number[]>(key);
            if (indexes) {
                data[email] = indexes;
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Redis error:", error);
        return NextResponse.json({}, { status: 200 }); // Return empty on error
    }
}

export async function POST(request: NextRequest) {
    // Check authentication
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token || !(await verifyToken(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, usedIndexes } = body;

        if (!email || !Array.isArray(usedIndexes)) {
            return NextResponse.json(
                { error: "Invalid data" },
                { status: 400 }
            );
        }

        await redis.set(`used-codes:${email}`, usedIndexes);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Redis error:", error);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 }
        );
    }
}

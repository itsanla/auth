import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "used-codes.json");

export async function GET() {
    try {
        const data = fs.readFileSync(FILE_PATH, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch {
        return NextResponse.json({});
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, usedIndexes } = body;

        // Read current data
        let data: Record<string, number[]> = {};
        try {
            data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
        } catch {
            // File doesn't exist, start fresh
        }

        // Update data
        data[email] = usedIndexes;

        // Write to file
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

        // Commit to GitHub
        await commitToGitHub(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 }
        );
    }
}

async function commitToGitHub(data: Record<string, number[]>) {
    const token = process.env.GITHUB_TOKEN;
    const owner = "itsanla";
    const repo = "auth";
    const filePath = "data/used-codes.json";

    if (!token) return;

    try {
        // Get current file SHA
        const getRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                },
            }
        );

        let sha = "";
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        }

        // Commit file
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
        await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Update used backup codes",
                    content,
                    sha: sha || undefined,
                }),
            }
        );
    } catch (error) {
        console.error("GitHub commit error:", error);
    }
}

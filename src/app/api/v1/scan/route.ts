import { NextResponse } from "next/server";

import { getEngineInternalApiBaseUrl } from "@/lib/engine";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.url || typeof body.url !== "string") {
            return NextResponse.json(
                { detail: "A valid URL is required." },
                { status: 400 },
            );
        }

        const baseUrl = getEngineInternalApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/v1/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: body.url }),
            cache: "no-store",
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json(
                {
                    detail:
                        payload?.detail ||
                        `Engine returned status ${response.status}`,
                },
                { status: response.status },
            );
        }

        return NextResponse.json(payload, { status: 200 });
    } catch {
        return NextResponse.json(
            { detail: "Failed to connect to the analysis engine. Please try again later." },
            { status: 502 },
        );
    }
}

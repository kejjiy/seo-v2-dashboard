import { NextResponse } from "next/server";

import { getEngineInternalApiBaseUrl } from "@/lib/engine";

type ConfirmState =
    | "confirmed"
    | "already_processed"
    | "invalid_or_expired"
    | "rollback_failed"
    | "temporary_error";

const VALID_STATES: Set<ConfirmState> = new Set([
    "confirmed",
    "already_processed",
    "invalid_or_expired",
    "rollback_failed",
    "temporary_error",
]);

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token || typeof token !== "string") {
            return NextResponse.json(
                {
                    state: "invalid_or_expired",
                    message: "Invalid confirmation link.",
                },
                { status: 400 },
            );
        }

        const baseUrl = getEngineInternalApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/v1/veto/confirm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
            cache: "no-store",
        });

        const payload = await response.json().catch(() => ({}));
        const state = payload?.state as ConfirmState | undefined;
        if (!response.ok || !state || !VALID_STATES.has(state)) {
            return NextResponse.json(
                {
                    state: "temporary_error",
                    message: "Temporary error. Please retry in a moment.",
                },
                { status: 502 },
            );
        }

        return NextResponse.json(
            {
                state,
                message:
                    typeof payload.message === "string"
                        ? payload.message
                        : "Request processed.",
            },
            { status: 200 },
        );
    } catch {
        return NextResponse.json(
            {
                state: "temporary_error",
                message: "Temporary error. Please retry in a moment.",
            },
            { status: 503 },
        );
    }
}

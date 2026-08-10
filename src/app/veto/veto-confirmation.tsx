"use client";

import { useMemo, useState } from "react";

type ConfirmState =
    | "ready"
    | "submitting"
    | "confirmed"
    | "already_processed"
    | "invalid_or_expired"
    | "rollback_failed"
    | "temporary_error";

type ConfirmPayload = {
    state: Exclude<ConfirmState, "ready" | "submitting">;
    message: string;
};

interface VetoConfirmationProps {
    token: string;
}

const stateContent: Record<
    Exclude<ConfirmState, "ready" | "submitting">,
    { title: string; description: string; testId: string }
> = {
    confirmed: {
        title: "Rollback confirmed",
        description: "The rollback has been queued successfully.",
        testId: "veto-state-confirmed",
    },
    already_processed: {
        title: "Already processed",
        description: "This change was already handled previously.",
        testId: "veto-state-already-processed",
    },
    invalid_or_expired: {
        title: "Invalid or expired link",
        description: "This veto link can no longer be used.",
        testId: "veto-state-invalid",
    },
    rollback_failed: {
        title: "Rollback failed",
        description:
            "Rollback could not be completed automatically. Please contact support.",
        testId: "veto-state-failed",
    },
    temporary_error: {
        title: "Temporary error",
        description: "Please retry in a few seconds.",
        testId: "veto-state-temporary-error",
    },
};

export function VetoConfirmation({ token }: VetoConfirmationProps) {
    const initialState: ConfirmState = token ? "ready" : "invalid_or_expired";
    const [state, setState] = useState<ConfirmState>(initialState);
    const [message, setMessage] = useState<string>("");

    const terminalState = useMemo(() => {
        if (state === "ready" || state === "submitting") {
            return null;
        }
        return state;
    }, [state]);

    const submitConfirmation = async () => {
        if (!token || state === "submitting") {
            return;
        }
        setState("submitting");
        setMessage("");

        try {
            const response = await fetch("/api/veto/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            const payload = (await response.json()) as ConfirmPayload;
            setState(payload.state);
            setMessage(payload.message);
        } catch {
            setState("temporary_error");
            setMessage("Please retry in a few seconds.");
        }
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
            <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">
                    One-Click Veto
                </h1>

                {state === "ready" || state === "submitting" ? (
                    <div data-testid="veto-state-ready" className="mt-4 space-y-4">
                        <p className="text-sm text-slate-600">
                            Confirm rollback for this specific change.
                        </p>
                        <button
                            type="button"
                            data-testid="veto-confirm-button"
                            onClick={submitConfirmation}
                            disabled={state === "submitting"}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {state === "submitting" ? "Confirming..." : "Confirm rollback"}
                        </button>
                    </div>
                ) : null}

                {terminalState ? (
                    <div data-testid={stateContent[terminalState].testId} className="mt-4 space-y-2">
                        <h2 className="text-lg font-medium text-slate-900">
                            {stateContent[terminalState].title}
                        </h2>
                        <p className="text-sm text-slate-600">
                            {message || stateContent[terminalState].description}
                        </p>
                        {terminalState === "temporary_error" ? (
                            <button
                                type="button"
                                data-testid="veto-retry-button"
                                onClick={() => setState("ready")}
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
                            >
                                Retry
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </section>
        </main>
    );
}

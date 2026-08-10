import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
    env: () => ({
        ENGINE_API_BASE_URL: "http://engine.test",
    }),
}));

describe("veto confirm route", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns confirmed state from engine", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(
                JSON.stringify({ state: "confirmed", message: "ok" }),
                { status: 200 },
            ) as Response,
        );

        const { POST } = await import("./route");
        const response = await POST(
            new Request("http://localhost/api/veto/confirm", {
                method: "POST",
                body: JSON.stringify({ token: "token-1" }),
            }),
        );

        expect(response.status).toBe(200);
        const payload = await response.json();
        expect(payload.state).toBe("confirmed");
    });

    it("returns invalid_or_expired when token is missing", async () => {
        const { POST } = await import("./route");
        const response = await POST(
            new Request("http://localhost/api/veto/confirm", {
                method: "POST",
                body: JSON.stringify({}),
            }),
        );

        expect(response.status).toBe(400);
        const payload = await response.json();
        expect(payload.state).toBe("invalid_or_expired");
    });

    it("maps upstream failures to temporary_error", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(JSON.stringify({ error: "boom" }), { status: 500 }) as Response,
        );

        const { POST } = await import("./route");
        const response = await POST(
            new Request("http://localhost/api/veto/confirm", {
                method: "POST",
                body: JSON.stringify({ token: "token-1" }),
            }),
        );

        expect(response.status).toBe(502);
        const payload = await response.json();
        expect(payload.state).toBe("temporary_error");
    });
});

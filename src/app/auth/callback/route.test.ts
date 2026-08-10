import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the Supabase server client before importing route
vi.mock("@/lib/supabase/server", () => ({
    default: vi.fn(),
}));

describe("Auth Callback Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET handler", () => {
        it("should redirect to home on successful code exchange", async () => {
            const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
            const mockCreateClient = await import("@/lib/supabase/server");
            vi.mocked(mockCreateClient.default).mockResolvedValue({
                auth: {
                    exchangeCodeForSession: mockExchangeCodeForSession,
                },
            } as never);

            const { GET } = await import("./route");
            const request = new NextRequest(
                "http://localhost:3000/auth/callback?code=test-code"
            );

            const response = await GET(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/");
            expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-code");
        });

        it("should redirect to custom next URL when provided", async () => {
            const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
            const mockCreateClient = await import("@/lib/supabase/server");
            vi.mocked(mockCreateClient.default).mockResolvedValue({
                auth: {
                    exchangeCodeForSession: mockExchangeCodeForSession,
                },
            } as never);

            const { GET } = await import("./route");
            const request = new NextRequest(
                "http://localhost:3000/auth/callback?code=test-code&next=/dashboard"
            );

            const response = await GET(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
        });

        it("should redirect to error page when code exchange fails", async () => {
            const mockExchangeCodeForSession = vi.fn().mockResolvedValue({
                error: { message: "Invalid code" },
            });
            const mockCreateClient = await import("@/lib/supabase/server");
            vi.mocked(mockCreateClient.default).mockResolvedValue({
                auth: {
                    exchangeCodeForSession: mockExchangeCodeForSession,
                },
            } as never);

            const { GET } = await import("./route");
            const request = new NextRequest(
                "http://localhost:3000/auth/callback?code=invalid-code"
            );

            const response = await GET(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe(
                "http://localhost:3000/auth/auth-code-error"
            );
        });

        it("should redirect to error page when no code is provided", async () => {
            const { GET } = await import("./route");
            const request = new NextRequest(
                "http://localhost:3000/auth/callback"
            );

            const response = await GET(request);

            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toBe(
                "http://localhost:3000/auth/auth-code-error"
            );
        });
    });
});

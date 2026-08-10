import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HeroSection } from "../hero-section";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock framer-motion to render children directly
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    },
}));

describe("HeroSection", () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    url: "https://example.com",
                    score: 85,
                    friction_points: []
                }),
            })
        ) as any;

        // Mock sessionStorage
        const sessionStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders the hero title and description", () => {
        render(<HeroSection />);
        expect(screen.getByText(/Is your content/i)).toBeInTheDocument();
        expect(screen.getByText(/working for you/i)).toBeInTheDocument();
    });

    it("renders the input and button initially", () => {
        render(<HeroSection />);
        expect(screen.getByPlaceholderText(/https:\/\/your-website.com/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Scan My Site/i })).toBeInTheDocument();
    });

    it("shows error for invalid URL", async () => {
        render(<HeroSection />);
        const input = screen.getByPlaceholderText(/https:\/\/your-website.com/i);
        const button = screen.getByRole("button", { name: /Scan My Site/i });

        fireEvent.change(input, { target: { value: "invalid-url" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
        });
    });

    it("starts scanning, calls API, and redirects on success", async () => {
        render(<HeroSection />);
        const input = screen.getByTestId("scan-url-input");
        const button = screen.getByTestId("scan-submit-button");

        fireEvent.change(input, { target: { value: "https://example.com" } });
        fireEvent.click(button);

        // Should show terminal log header
        await waitFor(() => {
            expect(screen.getByText(/seo-v2-scanner — bash/i)).toBeInTheDocument();
        });

        // Verify API call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v1/scan', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ url: "https://example.com" }),
            }));
        });

        // Verify sessionStorage
        await waitFor(() => {
            expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
                'last_scan_results',
                expect.stringContaining('"score":85')
            );
        });

        // Should eventually redirect to results page
        await waitFor(() => {
            expect(screen.getByText(/Redirecting to results.../i)).toBeInTheDocument();
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/scan/results'));
        }, { timeout: 3000 });
    });

    it("handles API errors gracefully", async () => {
        // Mock API failure
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ detail: "Server error" }),
            })
        ) as any;

        render(<HeroSection />);
        const input = screen.getByTestId("scan-url-input");
        const button = screen.getByTestId("scan-submit-button");

        fireEvent.change(input, { target: { value: "https://example.com" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Server error/i)).toBeInTheDocument();
        });
    });
});

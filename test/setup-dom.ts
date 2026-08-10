/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock next/image
vi.mock("next/image", () => ({
    __esModule: true,
    default: function MockImage({ src, alt, ...props }: { src: string; alt: string;[key: string]: unknown }) {
        return React.createElement("img", { src, alt, ...props });
    },
}));

// Mock LayoutSidebar to avoid react-query dependencies
vi.mock("@/components/layout-sidebar", () => ({
    __esModule: true,
    default: function MockLayoutSidebar({ children }: { children: React.ReactNode }) {
        return React.createElement("div", { "data-testid": "layout-sidebar" }, children);
    },
}));

// Mock @tanstack/react-query - keep real implementations
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        // Preserve all exports from the original module
    };
});

// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
    __esModule: true,
    default: {
        auth: {
            signInWithOtp: vi.fn(),
            exchangeCodeForSession: vi.fn(),
            setSession: vi.fn(),
            getUser: vi.fn(),
        },
    },
}));

// Setup global mocks for browser APIs
if (typeof window !== "undefined") {
    Object.defineProperty(window, "location", {
        value: {
            href: "http://localhost:3000",
            origin: "http://localhost:3000",
            pathname: "/auth/login",
            search: "",
            hash: "",
        },
        writable: true,
        configurable: true,
    });

    Object.defineProperty(window, "history", {
        value: {
            replaceState: vi.fn(),
            pushState: vi.fn(),
        },
        writable: true,
        configurable: true,
    });
}

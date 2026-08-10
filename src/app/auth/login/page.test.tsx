import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Setup mocks
const mockPush = vi.fn();
const mockSignInWithOtp = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => "/auth/login",
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase-client", () => ({
    __esModule: true,
    default: {
        auth: {
            signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
            exchangeCodeForSession: vi.fn(),
            setSession: vi.fn(),
            getUser: vi.fn(),
        },
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
    };
};

describe("LoginPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.location for each test
        Object.defineProperty(window, "location", {
            value: {
                href: "http://localhost:3000/auth/login",
                origin: "http://localhost:3000",
                pathname: "/auth/login",
                search: "",
                hash: "",
            },
            writable: true,
            configurable: true,
        });
    });

    describe("Rendering", () => {
        it("should render the login form with email input", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            expect(screen.getByTestId("email-input")).toBeInTheDocument();
        });

        it("should render the submit button", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            expect(screen.getByTestId("submit-button")).toBeInTheDocument();
        });

        it("should not render password input (magic link only)", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
        });

        it("should display the logo", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            expect(screen.getByRole("img")).toBeInTheDocument();
        });
    });


    describe("Form Validation", () => {
        it("should show error when submitting empty email", async () => {
            const user = userEvent.setup();
            render(<LoginPage />, { wrapper: createWrapper() });

            await user.click(screen.getByTestId("submit-button"));

            await waitFor(() => {
                expect(screen.getByTestId("email-error")).toBeInTheDocument();
            });
        });

        it("should not call API when email is empty", async () => {
            const user = userEvent.setup();
            render(<LoginPage />, { wrapper: createWrapper() });

            await user.click(screen.getByTestId("submit-button"));

            // API should not be called if validation fails
            expect(mockSignInWithOtp).not.toHaveBeenCalled();
        });
    });

    describe("Magic Link Flow", () => {
        it("should call signInWithOtp when form is submitted with valid email", async () => {
            const user = userEvent.setup();
            mockSignInWithOtp.mockResolvedValueOnce({
                data: { user: null, session: null },
                error: null,
            });

            render(<LoginPage />, { wrapper: createWrapper() });

            await user.type(screen.getByTestId("email-input"), "test@example.com");
            await user.click(screen.getByTestId("submit-button"));

            await waitFor(() => {
                expect(mockSignInWithOtp).toHaveBeenCalledWith({
                    email: "test@example.com",
                    options: {
                        emailRedirectTo: "http://localhost:3000/auth/callback",
                    },
                });
            });
        });

        it("should show success message after successful magic link request", async () => {
            const user = userEvent.setup();
            mockSignInWithOtp.mockResolvedValueOnce({
                data: { user: null, session: null },
                error: null,
            });

            render(<LoginPage />, { wrapper: createWrapper() });

            await user.type(screen.getByTestId("email-input"), "test@example.com");
            await user.click(screen.getByTestId("submit-button"));

            await waitFor(() => {
                expect(screen.getByTestId("success-message")).toBeInTheDocument();
            });
        });

        it("should show loading state while submitting", async () => {
            const user = userEvent.setup();
            // Create a promise that doesn't resolve immediately
            mockSignInWithOtp.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 1000))
            );

            render(<LoginPage />, { wrapper: createWrapper() });

            await user.type(screen.getByTestId("email-input"), "test@example.com");
            await user.click(screen.getByTestId("submit-button"));

            // Check loading state is shown
            await waitFor(() => {
                expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
            });
        });
    });

    describe("Accessibility", () => {
        it("should have email input with correct type", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            const emailInput = screen.getByTestId("email-input");
            expect(emailInput).toHaveAttribute("type", "email");
        });

        it("should have submit button with correct type", () => {
            render(<LoginPage />, { wrapper: createWrapper() });
            const submitButton = screen.getByTestId("submit-button");
            expect(submitButton).toHaveAttribute("type", "submit");
        });
    });
});

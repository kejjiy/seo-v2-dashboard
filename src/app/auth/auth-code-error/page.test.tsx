import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthCodeErrorPage from "./page";

// Get the mocked router
const mockPush = vi.fn();

vi.mock("next/navigation", async () => {
    return {
        useRouter: () => ({
            push: mockPush,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
        }),
        usePathname: () => "/",
        useSearchParams: () => new URLSearchParams(),
    };
});

describe("AuthCodeErrorPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render the error page with title", () => {
            render(<AuthCodeErrorPage />);
            expect(screen.getByText("auth.authCodeError.title")).toBeInTheDocument();
        });

        it("should render the error description", () => {
            render(<AuthCodeErrorPage />);
            expect(screen.getByText("auth.authCodeError.description")).toBeInTheDocument();
        });

        it("should render the error message", () => {
            render(<AuthCodeErrorPage />);
            expect(screen.getByText("auth.authCodeError.message")).toBeInTheDocument();
        });

        it("should display the logo", () => {
            render(<AuthCodeErrorPage />);
            expect(screen.getByRole("img")).toBeInTheDocument();
        });

        it("should have a back to login button", () => {
            render(<AuthCodeErrorPage />);
            expect(screen.getByRole("button")).toBeInTheDocument();
            expect(screen.getByText("auth.authCodeError.backToLogin")).toBeInTheDocument();
        });
    });

    describe("Navigation", () => {
        it("should navigate to login page when button is clicked", async () => {
            const user = userEvent.setup();
            render(<AuthCodeErrorPage />);

            await user.click(screen.getByRole("button"));

            expect(mockPush).toHaveBeenCalledWith("/auth/login");
        });
    });
});

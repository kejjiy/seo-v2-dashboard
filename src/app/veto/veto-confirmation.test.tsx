import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { VetoConfirmation } from "./veto-confirmation";

describe("VetoConfirmation", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("shows invalid state when token is missing", () => {
        render(<VetoConfirmation token="" />);
        expect(screen.getByTestId("veto-state-invalid")).toBeInTheDocument();
    });

    it("confirms rollback and renders success state", async () => {
        const user = userEvent.setup();
        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    state: "confirmed",
                    message: "Rollback queued.",
                }),
                { status: 200 },
            ) as Response,
        );

        render(<VetoConfirmation token="token-1" />);
        await user.click(screen.getByTestId("veto-confirm-button"));

        await waitFor(() => {
            expect(screen.getByTestId("veto-state-confirmed")).toBeInTheDocument();
        });
    });

    it("renders already processed state from API", async () => {
        const user = userEvent.setup();
        vi.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    state: "already_processed",
                    message: "Already handled.",
                }),
                { status: 200 },
            ) as Response,
        );

        render(<VetoConfirmation token="token-1" />);
        await user.click(screen.getByTestId("veto-confirm-button"));

        await waitFor(() => {
            expect(
                screen.getByTestId("veto-state-already-processed"),
            ).toBeInTheDocument();
        });
    });
});

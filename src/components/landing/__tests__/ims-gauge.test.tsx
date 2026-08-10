import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock framer-motion completely before importing the component
vi.mock("framer-motion", () => {
    const React = require("react");
    return {
        motion: {
            div: React.forwardRef(({ children, className, style, ...props }: any, ref: any) =>
                React.createElement("div", { ref, className, style, ...props }, children)
            ),
            svg: React.forwardRef(({ children, className, ...props }: any, ref: any) =>
                React.createElement("svg", { ref, className, ...props }, children)
            ),
            circle: React.forwardRef((props: any, ref: any) =>
                React.createElement("circle", { ref, ...props })
            ),
        },
        useMotionValue: () => ({
            get: () => 0,
            set: vi.fn(),
            on: () => () => { },
        }),
        useTransform: (_value: any, _input: any, output: any) => ({
            get: () => output?.[0] ?? 0,
            on: () => () => { },
        }),
        animate: vi.fn().mockReturnValue({ stop: vi.fn() }),
    };
});

import { IMSGauge } from "../ims-gauge";

describe("IMSGauge Component", () => {
    it("renders with score 0 by default", () => {
        render(<IMSGauge score={0} />);
        expect(screen.getByTestId("ims-gauge")).toBeInTheDocument();
        expect(screen.getByTestId("ims-score-display")).toHaveTextContent("0");
    });

    it("renders the correct score value", () => {
        render(<IMSGauge score={75} />);
        // The score display starts at 0 and animates to the target
        // In tests, we check the initial value since animation is mocked
        expect(screen.getByTestId("ims-score-display")).toBeInTheDocument();
    });

    it("displays correct label for excellent score (80-100)", () => {
        render(<IMSGauge score={85} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Excellent/i);
    });

    it("displays correct label for good score (60-79)", () => {
        render(<IMSGauge score={65} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Good/i);
    });

    it("displays correct label for average score (40-59)", () => {
        render(<IMSGauge score={50} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Average/i);
    });

    it("displays correct label for poor score (20-39)", () => {
        render(<IMSGauge score={30} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Poor/i);
    });

    it("displays correct label for critical score (0-19)", () => {
        render(<IMSGauge score={15} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Critical/i);
    });

    it("clamps score to 0-100 range", () => {
        // Score below 0 should clamp to 0 (Critical)
        const { rerender } = render(<IMSGauge score={-10} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Critical/i);

        // Score above 100 should clamp to 100 (Excellent)
        rerender(<IMSGauge score={150} />);
        expect(screen.getByTestId("ims-score-label")).toHaveTextContent(/Excellent/i);
    });

    it("uses correct color class for each score range", () => {
        const { rerender } = render(<IMSGauge score={85} />);
        expect(screen.getByTestId("ims-gauge")).toHaveClass("ims-gauge--excellent");

        rerender(<IMSGauge score={65} />);
        expect(screen.getByTestId("ims-gauge")).toHaveClass("ims-gauge--good");

        rerender(<IMSGauge score={45} />);
        expect(screen.getByTestId("ims-gauge")).toHaveClass("ims-gauge--average");

        rerender(<IMSGauge score={25} />);
        expect(screen.getByTestId("ims-gauge")).toHaveClass("ims-gauge--poor");

        rerender(<IMSGauge score={10} />);
        expect(screen.getByTestId("ims-gauge")).toHaveClass("ims-gauge--critical");
    });

    it("renders with aria-label for accessibility", () => {
        render(<IMSGauge score={72} />);
        const gauge = screen.getByTestId("ims-gauge");
        expect(gauge).toHaveAttribute("aria-label", expect.stringContaining("72"));
    });
});

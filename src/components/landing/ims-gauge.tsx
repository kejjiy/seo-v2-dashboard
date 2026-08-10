"use client";

import { useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface IMSGaugeProps {
    /** Score between 0 and 100 */
    score: number;
    /** Optional animation duration in seconds */
    animationDuration?: number;
    /** Optional size in pixels */
    size?: number;
}

type ScoreLevel = "critical" | "poor" | "average" | "good" | "excellent";

interface ScoreConfig {
    label: string;
    className: string;
    colorClass: string;
}

const SCORE_CONFIGS: Record<ScoreLevel, ScoreConfig> = {
    excellent: {
        label: "Excellent",
        className: "ims-gauge--excellent",
        colorClass: "text-emerald-500",
    },
    good: {
        label: "Good",
        className: "ims-gauge--good",
        colorClass: "text-green-500",
    },
    average: {
        label: "Average",
        className: "ims-gauge--average",
        colorClass: "text-yellow-500",
    },
    poor: {
        label: "Poor",
        className: "ims-gauge--poor",
        colorClass: "text-orange-500",
    },
    critical: {
        label: "Critical",
        className: "ims-gauge--critical",
        colorClass: "text-red-500",
    },
};

function getScoreLevel(score: number): ScoreLevel {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "average";
    if (score >= 20) return "poor";
    return "critical";
}

export function IMSGauge({
    score,
    animationDuration = 1.5,
    size = 240,
}: IMSGaugeProps) {
    // Clamp score to 0-100 range. Handle NaN by defaulting to 0.
    const safeScore = isNaN(score) ? 0 : score;
    const clampedScore = Math.max(0, Math.min(100, safeScore));
    const scoreConfig = SCORE_CONFIGS[getScoreLevel(clampedScore)];

    // SVG dimensions
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Animated value for the score
    const motionScore = useMotionValue(0);
    const displayScore = useTransform(motionScore, (val) => Math.round(val));
    const scoreRef = useRef<HTMLSpanElement>(null);

    // Animated stroke dash
    const progressOffset = useTransform(
        motionScore,
        [0, 100],
        [circumference, 0]
    );

    useEffect(() => {
        const controls = animate(motionScore, clampedScore, {
            duration: animationDuration,
            ease: "easeOut",
        });

        // Update the displayed score text
        const unsubscribe = displayScore.on("change", (val) => {
            if (scoreRef.current) {
                scoreRef.current.textContent = String(Math.round(val));
            }
        });

        return () => {
            controls.stop();
            unsubscribe();
        };
    }, [clampedScore, animationDuration, motionScore, displayScore]);

    return (
        <motion.div
            data-testid="ims-gauge"
            aria-label={`Intent Match Score: ${clampedScore} out of 100`}
            className={cn(
                "relative flex flex-col items-center justify-center",
                scoreConfig.className
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="rotate-[-90deg]"
            >
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-800"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: progressOffset }}
                    className={cn(
                        "drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                        scoreConfig.colorClass
                    )}
                />
            </motion.svg>

            {/* Score display in center */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <span
                    ref={scoreRef}
                    data-testid="ims-score-display"
                    className="text-5xl font-bold tracking-tight text-white"
                >
                    0
                </span>
                <span
                    data-testid="ims-score-label"
                    className={cn(
                        "mt-1 text-sm font-medium uppercase tracking-widest",
                        scoreConfig.colorClass
                    )}
                >
                    {scoreConfig.label}
                </span>
                <span className="mt-1 text-xs text-slate-500">out of 100</span>
            </motion.div>
        </motion.div>
    );
}

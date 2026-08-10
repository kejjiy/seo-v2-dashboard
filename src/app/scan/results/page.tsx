"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertTriangle, AlertCircle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IMSGauge } from "@/components/landing/ims-gauge";
import { cn } from "@/lib/utils";
import type { FrictionPoint, FrictionSeverity } from "@/types/scan";

const SEVERITY_CONFIG: Record<
    FrictionSeverity,
    { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
    high: {
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
    },
    medium: {
        icon: AlertCircle,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
    },
    low: {
        icon: Info,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
    },
};

function FrictionPointItem({ point, index }: { point: FrictionPoint; index: number }) {
    const config = SEVERITY_CONFIG[point.severity];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={cn(
                "flex items-start gap-3 rounded-lg p-4",
                config.bgColor
            )}
        >
            <div
                data-testid={`friction-severity-${point.severity}`}
                className={cn("mt-0.5 flex-shrink-0", config.color)}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{point.message}</p>
                <p className={cn("mt-1 text-xs uppercase tracking-wide", config.color)}>
                    {point.severity} priority
                </p>
            </div>
        </motion.div>
    );
}

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [frictionPoints, setFrictionPoints] = useState<FrictionPoint[]>([]);

    // Parse URL params
    const url = searchParams.get("url") ?? "";
    // Robust parsing for score
    const scoreParam = searchParams.get("score");
    const score = scoreParam ? parseInt(scoreParam, 10) || 0 : 0;

    useEffect(() => {
        const loadResults = () => {
            try {
                // 1. Try to get full results from session storage (preferred)
                const storedData = sessionStorage.getItem('last_scan_results');
                if (storedData) {
                    const parsed = JSON.parse(storedData);
                    if (parsed.friction_points) {
                        setFrictionPoints(parsed.friction_points);
                        return;
                    }
                }

                // 2. Fallback to URL params (legacy/shareable links)
                const frictionPointsRaw = searchParams.get("friction_points");
                if (frictionPointsRaw) {
                    const parsed = JSON.parse(frictionPointsRaw);
                    if (Array.isArray(parsed)) {
                        setFrictionPoints(parsed);
                    }
                }
            } catch (error) {
                console.error("Failed to parse results:", error);
                // We keep frictionPoints empty if parsing fails
            } finally {
            }
        };

        loadResults();
    }, [searchParams]);

    // Sort friction points by severity: high > medium > low
    const sortedFrictionPoints = [...frictionPoints].sort((a: FrictionPoint, b: FrictionPoint) => {
        const order: Record<FrictionSeverity, number> = { high: 0, medium: 1, low: 2 };
        return order[a.severity] - order[b.severity];
    });

    const handleScanAnother = () => {
        sessionStorage.removeItem('last_scan_results');
        router.push("/");
    };

    return (
        <div
            data-testid="results-page"
            className="flex min-h-screen flex-col bg-slate-950 text-slate-50"
        >
            {/* Header */}
            <header className="container flex h-16 items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500" />
                    <span className="text-xl font-bold tracking-tight">SEO-v2</span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-500">
                            Sign up
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1">
                <section className="relative overflow-hidden px-4 py-12 md:px-8 md:py-24">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />

                    <div className="container mx-auto max-w-5xl">
                        {/* Back link */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <Button
                                variant="ghost"
                                onClick={handleScanAnother}
                                data-testid="cta-scan-another"
                                className="text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Scan Another Site
                            </Button>
                        </motion.div>

                        {/* Main Content */}
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Left Column - Score */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <Card className="w-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl text-white">
                                            Intent Match Score
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Analysis for{" "}
                                            <span className="font-semibold text-emerald-400 break-all">
                                                {url}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center gap-6 pb-8">
                                        <IMSGauge score={score} />

                                        {/* CTA Button */}
                                        <Link href="/auth/signup" className="w-full max-w-xs">
                                            <Button
                                                data-testid="cta-fix-my-site"
                                                size="lg"
                                                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
                                            >
                                                Fix My Site
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <p className="text-center text-xs text-slate-500">
                                            Get personalized recommendations to improve your score
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Right Column - Issues */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-white">
                                            Friction Points
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            {sortedFrictionPoints.length === 0
                                                ? "No issues detected"
                                                : `${sortedFrictionPoints.length} issue${sortedFrictionPoints.length !== 1 ? "s" : ""} found`}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {sortedFrictionPoints.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
                                                    <svg
                                                        className="h-8 w-8 text-emerald-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-medium text-emerald-400">
                                                    Looking great!
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Your page is well-optimized
                                                </p>
                                            </div>
                                        ) : (
                                            sortedFrictionPoints.map((point, index) => (
                                                <FrictionPointItem
                                                    key={`${point.message}-${index}`}
                                                    point={point}
                                                    index={index}
                                                />
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Bottom CTA Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="mt-12 text-center"
                        >
                            <h2 className="text-2xl font-bold text-white">
                                Ready to boost your conversions?
                            </h2>
                            <p className="mt-2 text-slate-400">
                                Our AI-powered platform can help you fix these issues automatically.
                            </p>
                            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link href="/auth/signup">
                                    <Button
                                        size="lg"
                                        className="gap-2 bg-emerald-600 px-8 text-white hover:bg-emerald-500"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
                <div className="container">
                    <p>© 2026 SEO-v2. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

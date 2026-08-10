"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Search, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminalLog } from "@/components/landing/terminal-log";

const urlSchema = z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)" });

export function HeroSection() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, message]);
    };

    const handleScan = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLogs([]);

        // Validate URL
        const result = urlSchema.safeParse(url);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        setIsScanning(true);
        abortControllerRef.current = new AbortController();
        addLog(`Initializing scan for target: ${url}`);

        try {
            // Artificial delay for UX (to show the "Initializing" log)
            await new Promise((r) => setTimeout(r, 600));
            addLog("Connecting to scanner service...");

            const response = await fetch('/api/v1/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
                signal: abortControllerRef.current?.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Scan failed with status: ${response.status}`);
            }

            addLog("Analysis complete. Processing results...");
            const data = await response.json();

            // Store full results in sessionStorage to avoid URL length limits
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('last_scan_results', JSON.stringify(data));
            }

            addLog("Redirecting to results...");
            await new Promise((r) => setTimeout(r, 500));

            // Redirect to results page
            // We pass score and url in params for basic display/sharing, 
            // but the full friction points list is pulled from storage
            const params = new URLSearchParams({
                url: url,
                score: data.score?.toString() || "0",
            });

            router.push(`/scan/results?${params.toString()}`);

            // Reset after a moment (though we are navigating away)
            await new Promise((r) => setTimeout(r, 2000));
            setIsScanning(false);
            setLogs([]);

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }
            console.error('Scan error:', error);
            addLog("Error: Scan failed.");
            setError(error instanceof Error ? error.message : "Failed to scan the site. Please try again.");
            setIsScanning(false);
        }
    };

    return (
        <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:px-8">
            {/* Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl space-y-6"
            >
                <h1 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
                    Is your content <br />
                    <span className="text-emerald-500">working for you?</span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl">
                    Get a free AI-powered analysis of your landing page. Discover your
                    <span className="font-semibold text-emerald-400"> Intent Match Score</span> and fix friction points in seconds.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10 w-full max-w-lg"
            >
                {!isScanning ? (
                    <form onSubmit={handleScan} className="relative flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="https://your-website.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                data-testid="scan-url-input"
                                className="h-12 w-full rounded-full border-slate-700 bg-slate-900/50 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            data-testid="scan-submit-button"
                            className="h-12 rounded-full bg-emerald-600 px-8 font-semibold text-white hover:bg-emerald-500"
                        >
                            Scan My Site
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <TerminalLog logs={logs} />
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex items-center justify-center gap-2 text-sm text-red-400"
                    >
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </motion.div>
                )}
            </motion.div>

            {/* Trust Badges / Social Proof could go here */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-16 text-sm text-slate-600"
            >
                <p>Trusted by 100+ agencies and SaaS companies</p>
            </motion.div>
        </section>
    );
}

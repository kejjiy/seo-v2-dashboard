"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalLogProps {
    logs: string[];
    className?: string;
}

export function TerminalLog({ logs, className }: TerminalLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div
            className={cn(
                "w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-green-500 shadow-2xl",
                className
            )}
        >
            <div className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-500">seo-v2-scanner — bash</span>
            </div>
            <div
                ref={scrollRef}
                className="h-64 overflow-y-auto scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800"
            >
                {logs.map((log, index) => (
                    <motion.div
                        key={`log-${index}-${log.slice(0, 20)}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-1"
                        data-testid={`terminal-log-${index}`}
                    >
                        <span className="mr-2 text-blue-500">➜</span>
                        {log}
                    </motion.div>
                ))}
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block h-4 w-2 bg-green-500 align-middle"
                />
            </div>
        </div>
    );
}

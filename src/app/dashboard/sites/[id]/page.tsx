"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import LayoutSidebar from "@/components/layout-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Play, RefreshCw } from "lucide-react";
import { getEngineApiBaseUrl, getEngineAuthHeaders } from "@/lib/engine";
import { useSite } from "@/hooks/use-site";
import { useSiteAudit } from "@/hooks/use-site-audit";
import { useToast } from "@/hooks/use-toast";

const ACTIVE_STATUSES = new Set(["queued", "crawling", "rewriting", "generating_report"]);

function formatStageName(stage: string) {
    return stage
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function SiteDetailPage() {
    const params = useParams();
    const siteId = params.id as string;
    const { data: site, isLoading } = useSite(siteId);
    const {
        data: audit,
        isLoading: isAuditLoading,
        refetch: refetchAudit,
    } = useSiteAudit(siteId);
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLaunchingAudit, setIsLaunchingAudit] = useState(false);

    const handleLaunchAudit = async () => {
        setIsLaunchingAudit(true);
        try {
            const response = await fetch(
                `${getEngineApiBaseUrl()}/api/v1/sites/${siteId}/crawl`,
                {
                    method: "POST",
                    headers: await getEngineAuthHeaders(),
                }
            );

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.detail || "Failed to launch audit");
            }

            await refetchAudit();
            toast({
                title: "Audit launched",
                description: payload?.message || "The crawl has been queued.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error ? error.message : "Failed to launch audit",
                variant: "destructive",
            });
        } finally {
            setIsLaunchingAudit(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(
                `${getEngineApiBaseUrl()}/api/v1/sites/${siteId}/report/pdf`,
                {
                    method: "GET",
                    headers: await getEngineAuthHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `report_${site?.url?.replace(/[:/]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Success",
                description: "PDF report downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to download PDF",
                variant: "destructive",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <LayoutSidebar>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </LayoutSidebar>
        );
    }

    if (!site) {
        return (
            <LayoutSidebar>
                <div className="container py-8 text-center text-muted-foreground">
                    Site not found.
                </div>
            </LayoutSidebar>
        );
    }

    const auditIsActive = audit ? ACTIVE_STATUSES.has(audit.status) : false;
    const reportReady = Boolean(audit?.report.pdf_ready);

    return (
        <LayoutSidebar>
            <div className="container py-8 max-w-4xl">
                <div className="mb-8">
                    <Breadcrumbs
                        items={[
                            { label: "Dashboard", href: "/dashboard" },
                            {
                                label: site.url,
                                href: `/dashboard/sites/${siteId}`,
                                active: true,
                            },
                        ]}
                    />
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {site.url}
                        </h1>
                        <p className="text-muted-foreground">
                            IMS Score: {site.ims_score ?? 0}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="p-6 border rounded-lg bg-card">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Play className="h-5 w-5" />
                                    MVP Audit
                                </h2>
                                <p className="text-muted-foreground">
                                    Launch the full audit workflow from crawl to report delivery.
                                </p>
                            </div>
                            <Button onClick={handleLaunchAudit} disabled={isLaunchingAudit || auditIsActive}>
                                {isLaunchingAudit ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                )}
                                {auditIsActive ? "Audit Running" : "Launch Audit"}
                            </Button>
                        </div>

                        <div className="mt-6 rounded-lg border bg-background/60 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">Current status</p>
                                    <p className="text-sm text-muted-foreground">
                                        {isAuditLoading
                                            ? "Loading audit state..."
                                            : audit?.message || "No audit launched yet."}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => refetchAudit()}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${audit?.progress_percent ?? 0}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Progress: {audit?.progress_percent ?? 0}%
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {(audit?.stages ?? []).map((stage) => (
                                    <div key={stage.name} className="rounded-md border p-3">
                                        <p className="text-sm font-medium">{formatStageName(stage.name)}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {stage.status}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Eligible pages</p>
                                    <p className="text-lg font-semibold">{audit?.rewrite.eligible_pages ?? 0}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Recommendations ready</p>
                                    <p className="text-lg font-semibold">{audit?.rewrite.rewritten_pages ?? 0}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Needs review</p>
                                    <p className="text-lg font-semibold">{audit?.rewrite.review_pages ?? 0}</p>
                                </div>
                            </div>

                            {audit?.error_message ? (
                                <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                    {audit.error_message}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-card">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Reports
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Access the advisory PDF once the audit workflow has completed.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {reportReady ? (
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/sites/${siteId}/report`}>Open Report Page</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled>
                                    Open Report Page
                                </Button>
                            )}
                            <Button onClick={handleDownloadPDF} disabled={isDownloading || !reportReady}>
                                {isDownloading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Download PDF Report
                            </Button>
                        </div>
                        {!reportReady ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                                The report becomes available after crawl, rewrite, and report generation finish.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </LayoutSidebar>
    );
}

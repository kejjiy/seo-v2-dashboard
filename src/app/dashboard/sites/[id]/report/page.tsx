"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import LayoutSidebar from "@/components/layout-sidebar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { getEngineApiBaseUrl, getEngineAuthHeaders } from "@/lib/engine";
import { useSite } from "@/hooks/use-site";
import { useSiteAudit } from "@/hooks/use-site-audit";
import { useToast } from "@/hooks/use-toast";

export default function ReportPreviewPage() {
    const params = useParams();
    const siteId = params.id as string;
    const { data: site, isLoading } = useSite(siteId);
    const { data: audit, refetch: refetchAudit } = useSiteAudit(siteId);
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

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
                            },
                            {
                                label: "Report",
                                href: `/dashboard/sites/${siteId}/report`,
                                active: true,
                            },
                        ]}
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Audit Report
                            </h1>
                            <p className="text-muted-foreground">
                                Download the advisory PDF once the workflow is complete.
                            </p>
                        </div>
                        <Button onClick={handleDownloadPDF} disabled={isDownloading || !reportReady}>
                            {isDownloading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Download PDF
                        </Button>
                    </div>
                </div>

                <div className="border rounded-lg bg-card p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {audit?.message || "No audit has been completed for this site yet."}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
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

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={() => refetchAudit()} variant="outline">
                            Refresh Status
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/dashboard/sites/${siteId}`}>Back to Site</Link>
                        </Button>
                    </div>

                    {!reportReady ? (
                        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                            The PDF is intentionally delivered from the authenticated dashboard flow.
                            Launch or finish the audit first, then return here to download the file.
                        </div>
                    ) : null}
                </div>
            </div>
        </LayoutSidebar>
    );
}

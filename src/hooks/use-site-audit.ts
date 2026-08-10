import { getEngineApiBaseUrl, getEngineAuthHeaders } from "@/lib/engine";
import { useQuery } from "@tanstack/react-query";

export type AuditStage = {
    name: string;
    status: "pending" | "active" | "completed" | "failed";
};

export type SiteAuditStatus = {
    audit_id: string | null;
    site_id: string;
    status: string;
    current_stage: string | null;
    progress_percent: number;
    message: string | null;
    stages: AuditStage[];
    rewrite: {
        eligible_pages: number;
        rewritten_pages: number;
        failed_pages: number;
        review_pages: number;
    };
    report: {
        pdf_ready: boolean;
        delivery: string;
    };
    error_message: string | null;
};

const ACTIVE_AUDIT_STATUSES = new Set(["queued", "crawling", "rewriting", "generating_report"]);

export function useSiteAudit(siteId: string) {
    return useQuery({
        queryKey: ["site-audit", siteId],
        enabled: Boolean(siteId),
        queryFn: async (): Promise<SiteAuditStatus> => {
            const response = await fetch(
                `${getEngineApiBaseUrl()}/api/v1/sites/${siteId}/audit-status`,
                {
                    headers: await getEngineAuthHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load audit status");
            }

            return response.json();
        },
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status && ACTIVE_AUDIT_STATUSES.has(status) ? 3000 : false;
        },
    });
}

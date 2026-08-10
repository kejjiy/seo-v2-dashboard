'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import LayoutSidebar from '@/components/layout-sidebar';
import { APIKeyManager } from '@/components/dashboard/api-key-manager';
import { useSite } from '@/hooks/use-site';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Loader2 } from 'lucide-react';

export default function SiteSettingsPage() {
    const params = useParams();
    const siteId = params.id as string;
    const { data: site, isLoading } = useSite(siteId);

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

    return (
        <LayoutSidebar>
            <div className="container py-8 max-w-4xl">
                <div className="mb-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: site.url, href: `/dashboard/sites/${siteId}` },
                            { label: 'Settings', href: `/dashboard/sites/${siteId}/settings`, active: true },
                        ]}
                    />
                    <div className="mt-4">
                        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
                        <p className="text-muted-foreground">
                            Configure integration and security settings for {site.url}
                        </p>
                    </div>
                </div>

                <div className="grid gap-8">
                    <APIKeyManager siteId={siteId} />
                </div>
            </div>
        </LayoutSidebar>
    );
}

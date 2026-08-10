'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUserSites } from '@/hooks/use-user-sites';
import LayoutSidebar from '@/components/layout-sidebar';
import { OnboardingEmptyState } from '@/components/onboarding-empty-state';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: currentUser, isLoading: userLoading } = useCurrentUser();
    const { data: sites, isLoading: sitesLoading } = useUserSites();
    const t = useTranslations('home');

    const isLoading = userLoading || sitesLoading;
    const hasSites = sites && sites.length > 0;

    // Show onboarding if user has no sites
    if (!isLoading && !hasSites) {
        return (
            <LayoutSidebar>
                <OnboardingEmptyState />
            </LayoutSidebar>
        );
    }

    return (
        <LayoutSidebar>
            <div className="container py-8">
                <div className="flex flex-col gap-1">
                    <h1 className="relative text-3xl font-bold tracking-tighter sm:text-4xl">
                        <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                            {t('welcome', {
                                email: currentUser?.email || 'john.doe@example.com',
                            })}
                        </span>
                        {isLoading && <Skeleton className="absolute inset-0" />}
                    </h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>

                {/* Sites List */}
                {hasSites && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Your Sites</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sites.map((site) => (
                                <Link
                                    key={site.id}
                                    href={`/dashboard/sites/${site.id}`}
                                    className="p-4 border rounded-lg bg-card"
                                    data-testid="site-card"
                                >
                                    <p className="font-medium truncate">{site.url}</p>
                                    <p className="text-sm text-muted-foreground">
                                        IMS Score: {site.ims_score ?? 0}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </LayoutSidebar>
    );
}

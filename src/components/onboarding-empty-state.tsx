'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import supabaseClient from '@/lib/supabase-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlobeIcon, PlusIcon, RocketIcon } from 'lucide-react';



export function OnboardingEmptyState() {
    const t = useTranslations('onboarding');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [url, setUrl] = React.useState('');

    const addSiteMutation = useMutation({
        mutationFn: async (siteUrl: string) => {
            // First get the user's organization
            const { data: members, error: membersError } = await supabaseClient
                .from('members')
                .select('organization_id')
                .limit(1)
                .single();

            if (membersError || !members) {
                throw new Error('Could not find your organization');
            }

            // Add the site
            const { data, error } = await supabaseClient
                .from('sites')
                .insert({
                    url: siteUrl,
                    organization_id: members.organization_id,
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            toast({
                title: t('siteAddedSuccess'),
                variant: 'default',
            });
            setUrl('');
            queryClient.invalidateQueries({ queryKey: ['userSites'] });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            addSiteMutation.mutate(url.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            {/* Welcome Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <RocketIcon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
                    {t('welcomeTitle')}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t('welcomeSubtitle')}
                </p>
            </div>

            {/* Add Site Card */}
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-2">
                        <GlobeIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <CardTitle>{t('noSitesTitle')}</CardTitle>
                    <CardDescription>{t('noSitesDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="site-url">{t('addSiteUrl')}</Label>
                            <Input
                                id="site-url"
                                type="url"
                                placeholder={t('addSiteUrlPlaceholder')}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                data-testid="onboarding-site-url-input"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={addSiteMutation.isPending || !url.trim()}
                            data-testid="onboarding-add-site-button"
                        >
                            {addSiteMutation.isPending ? (
                                t('addingSite')
                            ) : (
                                <>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    {t('addFirstSite')}
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

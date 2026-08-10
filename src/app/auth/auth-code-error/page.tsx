'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import LayoutSidebar from '@/components/layout-sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AuthCodeErrorPage() {
    const router = useRouter();
    const t = useTranslations();

    return (
        <LayoutSidebar
            containerClassName="bg-muted/50"
            contentClassName="flex w-full h-full items-center justify-center"
        >
            <Card className="max-w-md w-full">
                <CardHeader className="flex justify-center items-center gap-4">
                    <Image src="/images/logo.svg" alt={t('common.logo')} width={150} height={100} />
                    <CardTitle className="text-center text-lg font-extrabold">
                        {t('auth.authCodeError.title')}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t('auth.authCodeError.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{t('auth.authCodeError.message')}</AlertDescription>
                    </Alert>
                    <Button
                        onClick={() => router.push('/auth/login')}
                        className="w-full"
                    >
                        {t('auth.authCodeError.backToLogin')}
                    </Button>
                </CardContent>
            </Card>
        </LayoutSidebar>
    );
}

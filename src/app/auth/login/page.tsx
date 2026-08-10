'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import LayoutSidebar from '@/components/layout-sidebar';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase-client';
import { useTranslations } from 'next-intl';

type LoginFormInputs = {
  email: string;
  password?: string;
};

export default function LoginPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const codeExchangeInProgress = useRef(false);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    trigger,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>();
  const t = useTranslations();

  useEffect(() => {
    const handleAuthParams = async () => {
      // Check for code in query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code && !codeExchangeInProgress.current) {
        codeExchangeInProgress.current = true;
        setIsLoading(true);
        try {
          // Remove code from URL
          params.delete('code');
          const newUrl =
            window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState({}, '', newUrl);

          const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

          if (error) {
            router.push('/auth/auth-code-error');
            return;
          }

          const next = params.get('next') || '/dashboard';
          queryClient.invalidateQueries();
          router.push(next);
        } catch (error) {
          console.error('Error exchanging code for session:', error);
          router.push('/auth/auth-code-error');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Handle hash params for other auth flows
      if (window.location.hash) {
        setIsLoading(true);
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (accessToken && refreshToken) {
            const {
              data: { user },
              error,
            } = await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            if (user) {
              let next: string = '/';

              if (type === 'invite') {
                next = '/change-password';
              } else {
                // Get the next parameter from URL
                const params = new URLSearchParams(window.location.search);
                next = params.get('next') || next;
              }

              queryClient.invalidateQueries();
              router.push(next);
            }
          }
        } catch (error) {
          console.error('Error setting session:', error);
          setError('root.serverError', {
            message: t('auth.authError'),
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthParams();
  }, [router, queryClient, setError, t]);

  const onSubmit = async (input: LoginFormInputs) => {
    setIsLoading(true);
    try {
      if (!input.password) {
        setError('password', { message: t('auth.passwordRequired') });
        setIsLoading(false);
        return;
      }
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;

      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get('next') || '/dashboard';

      // Redirect outside the router after authentication.
      // This forces the browser to attach the newly created auth cookies natively, bypassing the tricky App Router cache issues.
      window.location.href = nextParam;
    } catch (error) {
      console.log(error);
      setError('root.serverError', { message: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const isValid = await trigger('email');
    if (!isValid) return;

    setIsLoading(true);
    try {
      const email = getValues('email');
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.log(error);
      setError('root.serverError', { message: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutSidebar
      containerClassName="bg-muted/50"
      contentClassName="flex w-full h-full items-center justify-center"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="flex justify-center items-center gap-4">
          <Image src="/images/logo.svg" alt={t('common.logo')} width={150} height={100} />
          <CardTitle className="text-center text-lg font-extrabold">
            {isSuccess ? t('auth.checkEmailTitle') : t('auth.signInTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200 text-green-800" data-testid="success-message">
                <AlertDescription>{t('auth.checkEmailDescription')}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                    <Input
                      {...register('email', {
                        required: t('auth.emailRequired'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t('auth.emailInvalid'),
                        },
                      })}
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      data-testid="email-input"
                    />
                    {errors.email && <p className="text-sm text-destructive" data-testid="email-error">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
                    </div>
                    <Input
                      {...register('password')}
                      id="password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      data-testid="password-input"
                    />
                    {errors.password && <p className="text-sm text-destructive" data-testid="password-error">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
                        <span data-testid="loading-text">{t('auth.signInLoading')}</span>
                      </>
                    ) : (
                      t('auth.signInButton')
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={handleMagicLink}>
                    {t('auth.sendMagicLink')}
                  </Button>
                </div>

                {errors.root?.serverError && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.root.serverError.message}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </LayoutSidebar>
  );
}

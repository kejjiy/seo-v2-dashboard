'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

import LayoutSidebar from '@/components/layout-sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import supabaseClient from '@/lib/supabase-client';

type SignupFormInputs = {
  email: string;
  password: string;
};

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<SignupFormInputs>();

  const onSubmit = async (input: SignupFormInputs) => {
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        throw error;
      }

      reset();
      setSuccessMessage(
        data.user?.identities?.length
          ? 'Account created. Check your email to confirm your address.'
          : 'This email is already registered. Try logging in instead.'
      );
    } catch (error) {
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
          <Image src="/images/logo.svg" alt="SEO-v2" width={150} height={100} />
          <CardTitle className="text-center text-lg font-extrabold">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {successMessage ? (
              <Alert className="bg-green-50 border-green-200 text-green-800" data-testid="signup-success-message">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            {errors.root?.serverError?.message ? (
              <Alert variant="destructive" data-testid="signup-error-message">
                <AlertDescription>{errors.root.serverError.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  data-testid="signup-email-input"
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must contain at least 8 characters',
                    },
                  })}
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  data-testid="signup-password-input"
                />
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="signup-submit-button">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link href="/auth/login" className="text-primary underline">Log in</Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </LayoutSidebar>
  );
}

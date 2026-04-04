'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Leaf, Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  async function onSubmit(data: SignUpFormData) {
    setError(null);
    try {
      await signUp(
        data.email,
        data.password,
        data.displayName || undefined,
      );
      router.push('/onboarding');
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === 'auth/email-already-in-use'
      ) {
        setError('This email is already registered');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">GroceriesAI</h1>
        </div>
        <p className="text-sm text-muted-foreground">Create your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="displayName">
            Display name{' '}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            autoFocus
            disabled={isSubmitting}
            aria-describedby={
              errors.displayName ? 'displayName-error' : undefined
            }
            aria-invalid={errors.displayName ? 'true' : undefined}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-sm text-destructive">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={errors.email ? 'true' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={errors.password ? 'true' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              className="text-sm text-destructive"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Create account
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

import { RegisterForm } from '@/components/features/register-form';
import { AppShell } from '@/components/layout/app-shell';
import Link from 'next/link';

export default function RegisterPage() {
  const t = {
    title: 'Join Vivasayi',
    description: 'Create your free farmer account.',
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="font-headline text-3xl font-bold">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.description}
            </p>
          </div>
          <RegisterForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

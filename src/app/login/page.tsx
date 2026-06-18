import { LoginForm } from '@/components/features/login-form';
import Link from 'next/link';

export default function LoginPage() {
  const t = {
    title: 'Welcome to Vivasayi',
    description: 'Access your account to get started.',
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-headline text-3xl font-bold">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
'use client';

import { LoginForm } from '@/components/features/login-form';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-headline text-3xl font-bold">
            {t('LoginPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('LoginPage.description')}
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t('LoginPage.noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            {t('LoginPage.signUp')}
          </Link>
        </div>
      </div>
    </main>
  );
}

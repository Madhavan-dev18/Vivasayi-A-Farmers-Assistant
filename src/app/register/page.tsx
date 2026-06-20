'use client';

import { RegisterForm } from '@/components/features/register-form';
import { AppShell } from '@/components/layout/app-shell';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="font-headline text-3xl font-bold">
              {t('RegisterPage.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('RegisterPage.description')}
            </p>
          </div>
          <RegisterForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('RegisterPage.haveAccount')}{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              {t('RegisterPage.signIn')}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

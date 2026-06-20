'use client';

import PersonalizedSpace from "@/components/features/personalized-space";
import { AppShell } from "@/components/layout/app-shell";
import { useLanguage } from '@/context/LanguageContext';

export default function PersonalizedSpacePage() {
  const { t } = useLanguage();
  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">
            {t('PersonalizedSpacePage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('PersonalizedSpacePage.description')}
          </p>
        </div>
        <PersonalizedSpace />
      </div>
    </AppShell>
  );
}

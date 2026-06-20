'use client';

import CropRecommendationForm from '@/components/features/crop-recommendation-form';
import { AppShell } from '@/components/layout/app-shell';
import { useLanguage } from '@/context/LanguageContext';

export default function CropRecommendationPage() {
  const { t } = useLanguage();
  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">
            {t('CropRecommendationPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('CropRecommendationPage.description')}
          </p>
        </div>
        <CropRecommendationForm />
      </div>
    </AppShell>
  );
}

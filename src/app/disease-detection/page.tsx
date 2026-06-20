'use client';

import DiseaseDetection from '@/components/features/disease-detection-card';
import { AppShell } from '@/components/layout/app-shell';
import { useLanguage } from '@/context/LanguageContext';

export default function DiseaseDetectionPage() {
  const { t } = useLanguage();
  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold">
            {t('DiseaseDetectionPage.title')}
          </h1>
        </div>
        <DiseaseDetection />
      </div>
    </AppShell>
  );
}

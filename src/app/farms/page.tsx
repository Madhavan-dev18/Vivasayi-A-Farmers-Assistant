'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { FarmOverview } from '@/components/features/farm-overview';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export default function FarmsPage() {
  const { t } = useLanguage();
  return (
    <AppShell>
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold">{t('FarmsPage.title')}</h1>
            <p className="text-muted-foreground">
              {t('FarmsPage.description')}
            </p>
          </div>
          <Button asChild>
            <Link href="/farms/add">
              <Plus className="mr-2 h-4 w-4" />
              {t('FarmsPage.addFarm')}
            </Link>
          </Button>
        </div>
        <FarmOverview />
      </div>
    </AppShell>
  );
}
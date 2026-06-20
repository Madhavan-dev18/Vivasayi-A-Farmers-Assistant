'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { AppShell } from '@/components/layout/app-shell';
import { FarmOverview } from '@/components/features/farm-overview';
import { RecentSensorReadings } from '@/components/features/recent-sensor-readings';
import { CropStatus } from '@/components/features/crop-status';
import { WeatherCard } from '@/components/features/weather-card';
import { CropPricesCard } from '@/components/features/crop-prices-card';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();
  // Default to a sensible fallback; replaced with the user's actual farm
  // district as soon as it loads, instead of being hardcoded to Punjab.
  const [location, setLocation] = useState('Tamil Nadu');

  useEffect(() => {
    async function fetchPrimaryFarmDistrict() {
      // 1. Get the current user. If the auth call itself fails (expired
      // session, network issue, etc.) surface that distinctly instead of
      // letting it fall through to the farms query below.
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching authenticated user:', userError.message);
        return;
      }

      const user = userData?.user;
      if (!user) {
        // No logged-in session yet (e.g. auth still hydrating on first
        // mount). Not an error — just nothing to fetch yet.
        return;
      }

      // 2. Look up this user's primary farm district.
      const { data, error } = await supabase
        .from('farms')
        .select('district')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching farm district for weather:', error.message);
        return;
      }

      if (data?.district) {
        setLocation(data.district);
      }
      // If data is null, the user simply has no farm yet — fall back to
      // the default location, no error needed.
    }

    fetchPrimaryFarmDistrict();
  }, []);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('DashboardHomePage.title')}</h1>

        <FarmOverview />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CropStatus />
          <RecentSensorReadings />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeatherCard location={location} />
          <CropPricesCard />
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Droplets, Thermometer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function RecentSensorReadings() {
  const { t } = useLanguage();
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchReadings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch from Supabase instead of Firestore
        const { data, error } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setReadings(data || []);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReadings();
  }, []);

  if (loading) {
    return <div className="h-32 border rounded-xl bg-muted/50 animate-pulse"></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" /> {t('RecentSensorReadings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {readings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('RecentSensorReadings.noReadings')}</p>
        ) : (
          readings.map((reading, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
              <p className="text-xs text-muted-foreground">
                {new Date(reading.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-4 text-sm font-semibold">
                <span className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-orange-500"/> {reading.temperature || '--'}°C</span>
                <span className="flex items-center gap-1"><Droplets className="h-4 w-4 text-blue-500"/> {reading.humidity || '--'}%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
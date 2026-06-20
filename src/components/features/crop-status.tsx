'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle, Sprout, Calendar, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// 1. Re-define the Crop interface here since we deleted firestore.ts
export interface Crop {
  id: string;
  name: string;
  plantedDate: string;
  status: 'Healthy' | 'Needs Attention' | 'Harvesting Soon';
  progress: number;
}

export function CropStatus() {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Uses the shared supabase client from @/lib/supabase-client

  useEffect(() => {
    async function fetchCrops() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 3. Fetch cultivation plans directly from Supabase to serve as active crops
        const { data, error } = await supabase
          .from('cultivation_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map the Supabase data to our frontend format
        const formattedCrops: Crop[] = (data || []).map((c: any) => {
          let progress = 0;
          if (c.plan_data?.cultivationPlan && c.sowing_date) {
             const start = new Date(c.sowing_date);
             const now = new Date();
             const diff = now.getTime() - start.getTime();
             const currentWeek = diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
             const totalWeeks = c.plan_data.cultivationPlan.length;
             if (totalWeeks > 0) {
                 progress = Math.min(100, Math.round((Math.max(0, currentWeek) / totalWeeks) * 100));
             }
          }

          return {
            id: c.id,
            name: c.crop_type || 'Unknown Crop',
            plantedDate: c.sowing_date || c.created_at,
            status: c.status === 'active' ? 'Healthy' : (c.status === 'completed' ? 'Harvesting Soon' : 'Needs Attention'),
            progress: progress
          };
        });

        setCrops(formattedCrops);
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCrops();
  }, []);

  // Loading Skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" /> {t('CropStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // The actual UI
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5" /> {t('CropStatus.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crops.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('CropStatus.noCrops')}</p>
        ) : (
          crops.map((crop) => (
            <div key={crop.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <div className="font-medium leading-none flex items-center gap-2">
                  {t(`CropRecommendationForm.${crop.name.toLowerCase()}`) || crop.name}
                  <Badge 
                    variant={
                      crop.status === 'Healthy' ? 'default' : 
                      crop.status === 'Needs Attention' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {
                      crop.status === 'Healthy' ? t('CropStatus.healthy') : 
                      crop.status === 'Needs Attention' ? t('CropStatus.needsAttention') : 
                      t('CropStatus.harvestingSoon')
                    }
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" /> 
                  {t('CropStatus.planted')} {new Date(crop.plantedDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{crop.progress}%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
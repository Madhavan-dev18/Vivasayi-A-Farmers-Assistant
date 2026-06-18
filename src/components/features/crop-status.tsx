'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle, Sprout, Calendar, TrendingUp } from 'lucide-react';

// 1. Re-define the Crop interface here since we deleted firestore.ts
export interface Crop {
  id: string;
  name: string;
  plantedDate: string;
  status: 'Healthy' | 'Needs Attention' | 'Harvesting Soon';
  progress: number;
}

export function CropStatus() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Uses the shared supabase client from @/lib/supabase-client

  useEffect(() => {
    async function fetchCrops() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 3. Fetch crops directly from Supabase
        const { data, error } = await supabase
          .from('crops')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map the Supabase data to our frontend format
        const formattedCrops: Crop[] = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          plantedDate: c.planted_date || c.created_at,
          status: c.status || 'Healthy',
          progress: c.progress || 0
        }));

        setCrops(formattedCrops);
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCrops();
  }, [supabase]);

  // Loading Skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" /> Active Crops
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
          <Sprout className="h-5 w-5" /> Active Crops
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No crops planted yet.</p>
        ) : (
          crops.map((crop) => (
            <div key={crop.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="font-medium leading-none flex items-center gap-2">
                  {crop.name}
                  <Badge 
                    variant={
                      crop.status === 'Healthy' ? 'default' : 
                      crop.status === 'Needs Attention' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {crop.status}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" /> 
                  Planted: {new Date(crop.plantedDate).toLocaleDateString()}
                </p>
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
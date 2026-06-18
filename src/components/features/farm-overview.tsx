'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, Plus } from 'lucide-react';

export function FarmOverview() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFarms() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch farms directly from Supabase PostgreSQL
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setFarms(data || []);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFarms();
  }, []);

  if (loading) {
    return <div className="h-32 border rounded-xl bg-muted/50 animate-pulse"></div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {farms.length === 0 ? (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>No Farms Yet</CardTitle>
            <CardDescription>Add a farm profile to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/farms/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Farm
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        farms.map((farm, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{farm.name || 'My Farm'}</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farm.area || '--'} Acres</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Droplets className="h-3 w-3" /> {farm.soil_type || 'Unknown soil'}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoaderCircle, TrendingUp } from 'lucide-react';
import { getLatestCropPrices, type CropPrice } from '@/services/market-service';

export function CropPricesCard() {
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCropPrices() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLatestCropPrices('Rice', 'Tamil Nadu');
        setCropPrices((data || []).slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching crop prices:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCropPrices();
  }, []); // Empty deps – fetch once on mount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-6 text-primary" />
          <span>Mandi Price Reference</span>
        </CardTitle>
        <CardDescription>
          Reference commodity prices. Not a live feed — check your local mandi for today&apos;s actual rate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-destructive text-center">{error}</p>
          </div>
        ) : cropPrices.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">No crop prices found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Price (₹ / Quintal)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cropPrices.map((crop, index) => (
                <TableRow key={`${crop.commodity}-${index}`}>
                  <TableCell className="font-medium">{crop.commodity ?? '--'}</TableCell>
                  <TableCell>{crop.market ?? '--'}</TableCell>
                  <TableCell className="text-right">
                    {crop.modal_price != null
                      ? `₹${crop.modal_price.toLocaleString('en-IN')}`
                      : '--'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

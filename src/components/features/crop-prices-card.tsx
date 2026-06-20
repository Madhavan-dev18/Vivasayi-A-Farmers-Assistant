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
import { useLanguage } from '@/context/LanguageContext';

export function CropPricesCard() {
  const { t } = useLanguage();
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translateMarket = (market: string): string => {
    if (!market) return '--';
    const key = market.toLowerCase().replace(/[^a-z0-9]/g, '');
    const translated = t(`markets.${key}`);
    if (translated && translated !== `markets.${key}`) {
      return translated;
    }

    if (market.includes('(AI estimate)')) {
      const state = market.replace(' Mandi (AI estimate)', '');
      const stateKey = state.toLowerCase().replace(/[^a-z0-9]/g, '');
      const translatedState = t(`states.${stateKey}`) || state;

      const format = t('markets.aiEstimateFormat');
      if (format && format !== 'markets.aiEstimateFormat') {
        return format.replace('{state}', translatedState);
      }
      return `${translatedState} Mandi (AI estimate)`;
    }
    return market;
  };

  useEffect(() => {
    async function fetchCropPrices() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLatestCropPrices('Rice', 'Tamil Nadu');
        setCropPrices((data || []).slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('CropPricesCard.error'));
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
          <span>{t('CropPricesCard.title')}</span>
        </CardTitle>
        <CardDescription>
          {t('CropPricesCard.description')}
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
            <p className="text-muted-foreground">{t('CropPricesCard.noPrices')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('CropPricesCard.crop')}</TableHead>
                <TableHead>{t('CropPricesCard.market')}</TableHead>
                <TableHead className="text-right">{t('CropPricesCard.price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cropPrices.map((crop, index) => (
                <TableRow key={`${crop.commodity}-${index}`}>
                  <TableCell className="font-medium">
                    {crop.commodity ? (t(`CropRecommendationForm.${crop.commodity.toLowerCase()}`) || crop.commodity) : '--'}
                  </TableCell>
                  <TableCell>{translateMarket(crop.market)}</TableCell>
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

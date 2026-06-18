'use server';

// Market service – calls the Genkit market-price-flow for live AI-estimated
// prices, falling back to realistic static data if the AI call fails
// (e.g. missing API key, network issue, malformed response).

import { getMarketPrices } from '@/lib/market-price-flow';

export interface CropPrice {
  commodity: string;
  market: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  date: string;
}

const FALLBACK_PRICES: CropPrice[] = [
  { commodity: 'Rice',   market: 'Chennai Koyambedu', modal_price: 2150, min_price: 2000, max_price: 2300, date: new Date().toISOString().split('T')[0] },
  { commodity: 'Wheat',  market: 'Punjab Mandi',      modal_price: 2050, min_price: 1900, max_price: 2200, date: new Date().toISOString().split('T')[0] },
  { commodity: 'Maize',  market: 'Coimbatore Mandi',  modal_price: 1750, min_price: 1600, max_price: 1900, date: new Date().toISOString().split('T')[0] },
  { commodity: 'Tomato', market: 'Hosur Mandi',       modal_price: 1200, min_price: 900,  max_price: 1500, date: new Date().toISOString().split('T')[0] },
  { commodity: 'Onion',  market: 'Nashik Mandi',      modal_price: 1850, min_price: 1600, max_price: 2100, date: new Date().toISOString().split('T')[0] },
];

export async function getLatestCropPrices(
  crop: string = 'Rice',
  state: string = 'Tamil Nadu'
): Promise<CropPrice[]> {
  try {
    const result = await getMarketPrices({
      location: state,
      crops: [crop],
      seeds: [],
    });

    if (!result.crops || result.crops.length === 0) {
      console.warn('[market-service] AI returned no crop prices, using fallback data');
      return FALLBACK_PRICES;
    }

    const today = new Date().toISOString().split('T')[0];
    return result.crops.map((c) => ({
      commodity: c.name,
      market: `${state} Mandi (AI estimate)`,
      modal_price: c.pricePerQuintal,
      min_price: Math.round(c.pricePerQuintal * 0.9),
      max_price: Math.round(c.pricePerQuintal * 1.1),
      date: today,
    }));
  } catch (error) {
    console.error('[market-service] Failed to fetch AI prices, using fallback:', error);
    return FALLBACK_PRICES;
  }
}

// --- Historical production data ---------------------------------------
// Used by the crop-recommendation flow's `getHistoricalData` tool to give
// the model real-ish context on what has grown well in a district/season.

export interface HistoricalProductionRecord {
  district: string;
  season: string;
  crop: string;
  yieldQuintalsPerHectare: number;
  year: number;
}

const FALLBACK_HISTORICAL_DATA: HistoricalProductionRecord[] = [
  { district: 'Vellore',     season: 'Kharif', crop: 'Rice',   yieldQuintalsPerHectare: 48, year: 2025 },
  { district: 'Vellore',     season: 'Kharif', crop: 'Maize',  yieldQuintalsPerHectare: 32, year: 2025 },
  { district: 'Vellore',     season: 'Rabi',   crop: 'Wheat',  yieldQuintalsPerHectare: 28, year: 2025 },
  { district: 'Coimbatore',  season: 'Kharif', crop: 'Maize',  yieldQuintalsPerHectare: 36, year: 2025 },
  { district: 'Coimbatore',  season: 'Rabi',   crop: 'Tomato', yieldQuintalsPerHectare: 210, year: 2025 },
  { district: 'Nashik',      season: 'Rabi',   crop: 'Onion',  yieldQuintalsPerHectare: 180, year: 2025 },
];

/**
 * Returns historical crop production data for a district/season.
 *
 * TODO: Replace this fallback with a real query (e.g. a Supabase table or
 * a government open-data API such as data.gov.in's agricultural datasets)
 * once that integration is wired up.
 */
export async function getHistoricalProductionData(
  district: string,
  season: string
): Promise<HistoricalProductionRecord[]> {
  try {
    const matches = FALLBACK_HISTORICAL_DATA.filter(
      (record) =>
        record.district.toLowerCase() === district.toLowerCase() &&
        record.season.toLowerCase() === season.toLowerCase()
    );

    if (matches.length > 0) {
      console.log(`[market-service] Found ${matches.length} historical record(s) for ${district}/${season}`);
      return matches;
    }

    console.log(`[market-service] No exact historical match for ${district}/${season}, returning general fallback`);
    return FALLBACK_HISTORICAL_DATA;
  } catch (error) {
    console.error('[market-service] Failed to fetch historical production data:', error);
    return FALLBACK_HISTORICAL_DATA;
  }
}
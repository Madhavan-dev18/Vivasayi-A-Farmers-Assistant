'use server';

import { marketPriceFlow, type MarketPriceInput, type MarketPriceOutput } from '@/lib/market-price-flow';

export async function getMarketPrices(input: MarketPriceInput): Promise<MarketPriceOutput> {
  // This is a valid server action because the file ONLY exports an async function.
  return marketPriceFlow(input);
}
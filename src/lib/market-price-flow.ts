import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const MarketPriceInputSchema = z.object({
  location: z.string().describe('The location (e.g., state, country) for which to fetch prices.'),
  crops: z.array(z.string()).describe('A list of crops to fetch prices for.'),
  seeds: z.array(z.string()).describe('A list of seeds to fetch prices for.'),
});
export type MarketPriceInput = z.infer<typeof MarketPriceInputSchema>;

// Phase 1 Fix: Upgraded schema to return actual price data arrays instead of just a status
export const MarketPriceOutputSchema = z.object({
  crops: z.array(z.object({
    name: z.string(),
    pricePerQuintal: z.number(),
    percentageChange: z.number()
  })),
  seeds: z.array(z.object({
    name: z.string(),
    variety: z.string(),
    pricePerQuintal: z.number()
  })),
  status: z.string().describe('A status message indicating the result of the operation.'),
});
export type MarketPriceOutput = z.infer<typeof MarketPriceOutputSchema>;

export const marketPriceFlow = ai.defineFlow(
  {
    name: 'marketPriceFlow',
    inputSchema: MarketPriceInputSchema,
    outputSchema: MarketPriceOutputSchema,
  },
  async (input) => {
    // Replaced standalone 'generate' and 'definePrompt' with the safer 'ai.generate'
    const { output } = await ai.generate({
      prompt: `You are an expert agricultural market analyst. Find the current market prices for the following in ${input.location}:
      Crops: ${input.crops.join(', ')}
      Seeds: ${input.seeds.join(', ')}

      1. For each crop, estimate its price per quintal in Indian Rupees and the percentage change in the last 24 hours.
      2. For each seed, provide a common variety and its price per quintal in Indian Rupees.
      3. Provide a final status message confirming the analysis.`,
      output: { schema: MarketPriceOutputSchema }
    });

    if (!output) {
      throw new Error('Failed to get a response from the AI.');
    }

    return output;
  }
);

export async function getMarketPrices(input: MarketPriceInput): Promise<MarketPriceOutput> {
  return marketPriceFlow(input);
}
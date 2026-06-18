'use server';

/**
 * @fileOverview An AI agent that recommends crops based on soil analysis, weather data, and historical yields.
 *
 * - getCropRecommendations - A function that handles the crop recommendation process.
 * - CropRecommendationInput - The input type for the getCropRecommendations function.
 * - CropRecommendationOutput - The return type for the getCropRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHistoricalProductionData } from '@/services/market-service';
import { withGeminiRetry } from '@/ai/with-retry';

const getHistoricalDataTool = ai.defineTool(
  {
    name: 'getHistoricalData',
    description: 'Get historical crop production data for a specific district and season.',
    inputSchema: z.object({
      district: z.string().describe('The district to get data for.'),
      season: z.string().describe('The season (e.g., Kharif, Rabi).'),
    }),
    outputSchema: z.any(),
  },
  async ({ district, season }) => {
    return await getHistoricalProductionData(district, season);
  }
);

const CropRecommendationInputSchema = z.object({
  soilAnalysis: z
    .string()
    .describe('The results of a soil analysis, including pH, nitrogen, phosphorus, and potassium levels.'),
  weatherData: z
    .string()
    .describe('Current and historical weather data for the location, including temperature, rainfall, and sunlight.'),
  district: z.string().describe('The district where the farm is located.'),
  season: z.string().describe('The current farming season (e.g., Kharif, Rabi).'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendedCrops: z
    .string()
    .describe('A list of recommended crops, along with the reasons for the recommendations.'),
  plantingInstructions: z
    .string()
    .describe('Detailed planting instructions for the recommended crops, including timing, spacing, and fertilization.'),
  riskAssessment: z
    .string()
    .describe('An assessment of the risks associated with planting the recommended crops, including potential pests, diseases, and weather-related challenges.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function getCropRecommendations(input: CropRecommendationInput): Promise<CropRecommendationOutput> {
  return cropRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  tools: [getHistoricalDataTool],
  prompt: `You are an expert agricultural advisor. Your task is to recommend the best crops for a farmer.

First, use the getHistoricalData tool to fetch the historical crop production data for the specified district and season. This data shows what has been successfully grown in the area before.

Then, based on ALL the provided information (historical data, soil analysis, and weather), recommend the best crops.

Soil Analysis: {{{soilAnalysis}}}
Weather Data: {{{weatherData}}}
District: {{{district}}}
Season: {{{season}}}

Consider the following factors when making your recommendations:

*   **Historical Performance**: What crops have high production in the historical data for this district and season?
*   **Soil Suitability**: Match the crop requirements with the soil analysis data.
*   **Climate Compatibility**: Ensure the crops are suitable for the local weather conditions.
*   **Market Demand & Profitability**: Prioritize crops that are generally profitable.
*   **Risk Factors**: Mention potential risks.

Provide detailed planting instructions for the recommended crops and a brief risk assessment.
`,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await withGeminiRetry(() => prompt(input), {
      fallback: () => prompt(input, { model: 'googleai/gemini-2.5-flash' }),
    });
    if (!output) {
      throw new Error('Crop recommendation failed: the model returned no structured output.');
    }
    return output;
  }
);

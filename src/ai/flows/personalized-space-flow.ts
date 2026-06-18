'use server';

import { ai } from '@/ai/genkit';
import {
  PersonalizedCultivationPlanInputSchema,
  PersonalizedCultivationPlanOutputSchema
} from '@/ai/schemas/personalized-space-schema';
import { withGeminiRetry } from '@/ai/with-retry';

export const getPersonalizedCultivationPlan = ai.defineFlow(
  {
    name: 'getPersonalizedCultivationPlan',
    inputSchema: PersonalizedCultivationPlanInputSchema,
    outputSchema: PersonalizedCultivationPlanOutputSchema,
  },
  async (input) => {
    // Construct the prompt payload
    const promptMessage = `
      You are an expert agronomist and AI farming assistant. 
      Create a detailed, week-by-week cultivation plan for a farmer based on the following details.
      
      Crop: ${input.crop}
      District/Location: ${input.district}
      Planned Sowing Date: ${input.sowingDate}
      Farmer Profile: ${input.userProfile}
      ${!input.isSoilReportFile && input.soilReport ? `Soil Report Data: ${input.soilReport}` : ''}
      
      Ensure the output strictly follows the schema, providing a weekly stage, detailed tasks, and a daily breakdown.
    `;

    // Handle multimodal input if the user uploaded a file/image (Data URI)
    const messages: any[] = [{ text: promptMessage }];
    if (input.isSoilReportFile && input.soilReport) {
      messages.push({ media: { url: input.soilReport } });
    }

    // Call the AI model
    const { output } = await withGeminiRetry(
      () =>
        ai.generate({
          prompt: messages,
          output: {
            schema: PersonalizedCultivationPlanOutputSchema,
          },
        }),
      {
        fallback: () =>
          ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: messages,
            output: {
              schema: PersonalizedCultivationPlanOutputSchema,
            },
          }),
      }
    );

    if (!output) {
      throw new Error("AI failed to return a formatted cultivation plan.");
    }

    return output;
  }
);
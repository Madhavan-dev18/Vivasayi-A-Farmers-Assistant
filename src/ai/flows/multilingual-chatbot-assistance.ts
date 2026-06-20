// This is a server-side file.
'use server';

/**
 * @fileOverview A multilingual chatbot assistance AI agent for farmers.
 *
 * - multilingualChatbotAssistance - A function that handles the chatbot assistance process.
 * - MultilingualChatbotAssistanceInput - The input type for the multilingualChatbotAssistance function.
 * - MultilingualChatbotAssistanceOutput - The return type for the multilingualChatbotAssistance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { farmingData } from '@/lib/farm-data';
import { withGeminiRetry } from '@/ai/with-retry';

const MultilingualChatbotAssistanceInputSchema = z.object({
  query: z.string().describe('The question asked by the farmer in their local language.'),
  language: z.string().describe('The language of the query.'),
});
export type MultilingualChatbotAssistanceInput = z.infer<
  typeof MultilingualChatbotAssistanceInputSchema
>;

const MultilingualChatbotAssistanceOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question in the same language as the query.'),
});
export type MultilingualChatbotAssistanceOutput = z.infer<
  typeof MultilingualChatbotAssistanceOutputSchema
>;

export async function multilingualChatbotAssistance(
  input: MultilingualChatbotAssistanceInput
): Promise<MultilingualChatbotAssistanceOutput> {
  return multilingualChatbotAssistanceFlow(input);
}

const farmingDataContext = JSON.stringify(farmingData);

const prompt = ai.definePrompt({
  name: 'multilingualChatbotAssistancePrompt',
  input: {
    schema: MultilingualChatbotAssistanceInputSchema,
  },
  output: {
    schema: MultilingualChatbotAssistanceOutputSchema,
  },
  prompt: `You are Vivasayi Chat, a helpful AI chatbot assistant for Vivasayi (a farmer assistant application) in India.
      The farmer will ask a question in their local language, and you will respond in the same language.

      You have access to a local dataset with general information about Indian farming. Use this as your primary source of knowledge, especially for questions about crops, soil, and fertilizers. This allows you to answer questions even if you cannot access external information.

      Local Farming Dataset:
      \`\`\`json
      ${farmingDataContext}
      \`\`\`

      Language: {{{language}}}
      Question: {{{query}}}

      Based on the provided dataset and your general knowledge, answer the farmer's question.
      Answer: `,
});

const multilingualChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'multilingualChatbotAssistanceFlow',
    inputSchema: MultilingualChatbotAssistanceInputSchema,
    outputSchema: MultilingualChatbotAssistanceOutputSchema,
  },
  async input => {
    const { output } = await withGeminiRetry(() => prompt(input), {
      retries: 2,
      baseDelayMs: 600,
      // If gemini-3.5-flash is overloaded, try gemini-2.5-flash once as
      // a last resort before giving up — different model, often a
      // different capacity pool, so a 503 on one doesn't mean both are down.
      fallback: () => prompt(input, { model: 'googleai/gemini-2.5-flash' }),
    });
    if (!output) {
      throw new Error('Chatbot response failed: the model returned no structured output.');
    }
    return output;
  }
);

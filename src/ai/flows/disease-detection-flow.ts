'use server';

/**
 * @fileOverview An AI agent that detects diseases in plants from an image.
 *
 * - detectPlantDisease - A function that handles the plant disease detection process.
 * - DiseaseDetectionInput - The input type for the detectPlantDisease function.
 * - DiseaseDetectionOutput - The return type for the detectPlantDisease function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { withGeminiRetry } from '@/ai/with-retry';

const DiseaseDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .string()
    .optional()
    .describe('The language the response should be written in (e.g. "Tamil", "Hindi", "English"). Defaults to English if not specified.'),
});
export type DiseaseDetectionInput = z.infer<typeof DiseaseDetectionInputSchema>;

const DiseaseDetectionOutputSchema = z.object({
  disease: z.string().describe("The specific name of the detected disease or pest (e.g., 'Powdery Mildew', 'Aphids', 'Late Blight'). If the plant is healthy, return 'Healthy'."),
  confidence: z.number().describe('A confidence score (0-100) in the accuracy of the diagnosis. A score of 100 indicates certainty.'),
  treatment: z.string().describe("A concise, actionable, and easy-to-follow recommendation for treating the disease. If healthy, provide a relevant care tip (e.g., watering, sunlight)."),
  description: z.string().describe("A brief description of the diagnosis, including the key visual symptoms you identified to make your assessment.")
});
export type DiseaseDetectionOutput = z.infer<typeof DiseaseDetectionOutputSchema>;


export async function detectPlantDisease(input: DiseaseDetectionInput): Promise<DiseaseDetectionOutput> {
  return diseaseDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diseaseDetectionPrompt',
  input: { schema: DiseaseDetectionInputSchema },
  output: { schema: DiseaseDetectionOutputSchema },
  prompt: `You are an expert plant pathologist and agricultural diagnostician. Your task is to analyze an image of a plant and provide a precise diagnosis.

Follow these steps for your analysis:

1.  **Identify the Plant**: First, try to identify the plant species if possible (e.g., tomato, potato, rose). This can help narrow down potential diseases.
2.  **Observe Visual Symptoms**: Examine the image closely. Look for specific symptoms such as:
    *   **Spots or Lesions**: Note their color (e.g., brown, black, yellow), size, shape, and whether they have a border (e.g., a yellow halo).
    *   **Blight**: Look for large, irregular-shaped areas of dead tissue. For example, **Late Blight** on tomatoes or potatoes often appears as dark, water-soaked spots on leaves and stems, sometimes with a ring of white mold on the underside.
    *   **Growth**: Identify any powdery or fuzzy growth (e.g., white for Powdery Mildew, grey for Botrytis).
    *   **Discoloration**: Note any yellowing (chlorosis), browning, or blackening of leaves.
    *   **Pests**: Check for visible insects, eggs, or webbing.
3.  **Cross-Reference Knowledge**: Based on the plant type and observed symptoms, access your knowledge base of common plant diseases and pests to determine the most likely diagnosis.
4.  **Provide Diagnosis**: State the name of the disease or pest. If no issues are visible, classify the plant as 'Healthy'.
5.  **Assign Confidence**: Assign a confidence score to your diagnosis based on the clarity and uniqueness of the symptoms.
6.  **Describe Findings**: Briefly describe the key visual evidence that led to your conclusion.
7.  **Recommend Treatment**: Provide a simple, actionable treatment plan. For diseases, suggest organic or chemical solutions. For pests, recommend control methods. If healthy, give a relevant care tip.

Analyze the following image and provide your diagnosis in the specified format.

{{#if language}}Write your entire response — the disease name, description, and treatment — in {{language}}. Use the language's native script, not a transliteration into Latin/English letters.{{/if}}

Image: {{media url=photoDataUri}}`,
});

const diseaseDetectionFlow = ai.defineFlow(
  {
    name: 'diseaseDetectionFlow',
    inputSchema: DiseaseDetectionInputSchema,
    outputSchema: DiseaseDetectionOutputSchema,
  },
  async (input) => {
    const { output } = await withGeminiRetry(() => prompt(input), {
      fallback: () => prompt(input, { model: 'googleai/gemini-2.5-flash' }),
    });
    if (!output) {
      throw new Error('Disease detection failed: the model returned no structured output.');
    }
    return output;
  }
);

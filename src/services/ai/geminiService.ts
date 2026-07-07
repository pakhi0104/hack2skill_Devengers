import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = (() => {
  if (!GEMINI_API_KEY) return false;
  return !GEMINI_API_KEY.includes('your-gemini-api-key') && GEMINI_API_KEY.length > 10;
})();

function getClient(): GoogleGenerativeAI | null {
  if (!isGeminiConfigured) return null;
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/** Parse JSON from Gemini response, stripping markdown fences if present */
export function parseGeminiJson<T>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function generateWithGemini(prompt: string): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}

/** Gemini with Google Search Grounding (when supported by model) */
export async function searchWithGeminiGrounding(query: string): Promise<{ text: string; sources: string[] }> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ googleSearch: {} } as never],
    });

    const result = await model.generateContent(
      `Search official Indian government websites for: ${query}. 
       Focus on myscheme.gov.in, scholarships.gov.in, vidyalakshmi.co.in, india.gov.in, and official bank sites.
       List specific schemes with official URLs. Do not invent information.`
    );

    const text = result.response.text();
    const sources: string[] = [];

    // Extract grounding metadata if available
    const candidates = result.response.candidates;
    if (candidates?.[0]?.groundingMetadata) {
      const chunks = (candidates[0].groundingMetadata as { groundingChunks?: { web?: { uri?: string } }[] })
        .groundingChunks;
      chunks?.forEach((chunk) => {
        if (chunk.web?.uri) sources.push(chunk.web.uri);
      });
    }

    return { text, sources };
  } catch {
    // Grounding may not be available — fall back to standard generation
    const text = await generateWithGemini(
      `Based on official Indian government sources, list schemes related to: ${query}. Include official URLs where known.`
    );
    return { text, sources: [] };
  }
}

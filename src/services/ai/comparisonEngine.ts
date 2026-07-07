import type { CompareRow, SchemeRecommendation } from '../../types/schemes';
import { buildComparisonPrompt } from './promptTemplates';
import { generateWithGemini, parseGeminiJson, isGeminiConfigured } from './geminiService';

export function buildCompareRowsFromSchemes(schemes: SchemeRecommendation[]): CompareRow[] {
  return schemes.map((s) => ({
    schemeId: s.id,
    name: s.name,
    provider: s.provider,
    benefits: s.benefits.join('; ') || 'Unable to verify from official sources',
    eligibility: s.eligibility.join('; ') || 'Unable to verify from official sources',
    documents: s.documents.join(', ') || 'Unable to verify from official sources',
    interestRate: s.interestRate || 'Unable to verify from official sources',
    processingTime: s.processingTime || 'Unable to verify from official sources',
    deadline: s.deadline || 'Unable to verify from official sources',
    officialWebsite: s.officialWebsite || '',
    matchScore: s.matchScore,
    recommendation: s.aiRecommendation || s.shortDescription,
  }));
}

export async function compareSchemesWithAI(
  schemes: SchemeRecommendation[]
): Promise<{ rows: CompareRow[]; bestSchemeId: string }> {
  if (schemes.length < 2) {
    throw new Error('Select at least 2 schemes to compare');
  }
  if (schemes.length > 4) {
    throw new Error('You can compare up to 4 schemes at a time');
  }

  const rows = buildCompareRowsFromSchemes(schemes);

  if (!isGeminiConfigured) {
    const best = [...schemes].sort((a, b) => b.matchScore - a.matchScore)[0];
    return { rows, bestSchemeId: best.id };
  }

  try {
    const prompt = buildComparisonPrompt(
      schemes.map((s) => ({
        name: s.name,
        data: JSON.stringify({
          provider: s.provider,
          matchScore: s.matchScore,
          benefits: s.benefits,
          eligibility: s.eligibility,
          documents: s.documents,
          interestRate: s.interestRate,
          processingTime: s.processingTime,
          deadline: s.deadline,
          officialWebsite: s.officialWebsite,
        }),
      }))
    );

    const text = await generateWithGemini(prompt);
    const aiRows = parseGeminiJson<CompareRow[]>(text);

    const merged = rows.map((row) => {
      const aiRow = aiRows.find((r) => r.name === row.name || r.schemeId === row.schemeId);
      return aiRow ? { ...row, ...aiRow, schemeId: row.schemeId } : row;
    });

    const best = [...merged].sort((a, b) => b.matchScore - a.matchScore)[0];
    return { rows: merged, bestSchemeId: best.schemeId };
  } catch {
    const best = [...schemes].sort((a, b) => b.matchScore - a.matchScore)[0];
    return { rows, bestSchemeId: best.id };
  }
}

export function getBestScheme(rows: CompareRow[]): CompareRow | null {
  if (rows.length === 0) return null;
  return [...rows].sort((a, b) => b.matchScore - a.matchScore)[0];
}

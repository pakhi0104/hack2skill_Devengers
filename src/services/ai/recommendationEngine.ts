import type { Profile } from '../../types';
import type {
  CategoryAnswers,
  RecommendationResult,
  SchemeCategory,
  SchemeRecommendation,
  MatchLevel,
} from '../../types/schemes';
import type { SearchResultItem } from '../../types/schemes';
import { buildAnalysisPrompt } from './promptTemplates';
import { generateWithGemini, parseGeminiJson, isGeminiConfigured } from './geminiService';

function toMatchLevel(score: number): MatchLevel {
  if (score >= 80) return 'High Match';
  if (score >= 60) return 'Medium Match';
  return 'Low Match';
}

function normalizeRecommendation(raw: Partial<SchemeRecommendation>, category: SchemeCategory): SchemeRecommendation {
  const score = Math.min(100, Math.max(0, Number(raw.matchScore) || 0));
  return {
    id: raw.id || `scheme-${Math.random().toString(36).slice(2, 9)}`,
    name: raw.name || 'Unknown Scheme',
    provider: raw.provider || 'Government of India',
    category: (raw.category as SchemeCategory) || category,
    matchScore: score,
    matchLevel: raw.matchLevel || toMatchLevel(score),
    shortDescription: raw.shortDescription || '',
    whyRecommended: raw.whyRecommended || [],
    benefits: raw.benefits || [],
    eligibility: raw.eligibility || [],
    documents: raw.documents || [],
    interestRate: raw.interestRate,
    processingTime: raw.processingTime,
    deadline: raw.deadline,
    officialWebsite: raw.officialWebsite || '',
    applyLink: raw.applyLink,
    importantInfo: raw.importantInfo,
    faqs: raw.faqs,
    aiSummary: raw.aiSummary,
    aiRecommendation: raw.aiRecommendation,
    whyBetter: raw.whyBetter,
    approvalProbability: raw.approvalProbability,
    verified: raw.verified ?? false,
    sourceUrl: raw.sourceUrl,
  };
}

export async function analyzeAndRankSchemes(
  category: SchemeCategory,
  profile: Profile,
  answers: CategoryAnswers,
  searchResults: SearchResultItem[]
): Promise<RecommendationResult> {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key is required for AI analysis. Add VITE_GEMINI_API_KEY to .env');
  }

  const prompt = buildAnalysisPrompt(category, profile, answers, searchResults);
  const text = await generateWithGemini(prompt);
  const parsed = parseGeminiJson<RecommendationResult>(text);

  const recommendations = (parsed.recommendations || [])
    .map((r) => normalizeRecommendation(r, category))
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    recommendations,
    ineligible: parsed.ineligible || [],
    nextSuggestions: parsed.nextSuggestions || [],
    roadmap: parsed.roadmap || [],
    documentChecklist: parsed.documentChecklist || [],
    applicationReadiness: parsed.applicationReadiness ?? 0,
    missingDocuments: parsed.missingDocuments || [],
    searchSources: parsed.searchSources || searchResults.map((r) => r.source),
    rawSearchCount: searchResults.length,
  };
}

/** Rank already-fetched recommendations by filters */
export function filterRecommendations(
  schemes: SchemeRecommendation[],
  filters: {
    provider?: string;
    state?: string;
    interestRate?: string;
    category?: string;
    deadline?: string;
    eligibility?: string;
    matchScore?: string;
  }
): SchemeRecommendation[] {
  return schemes.filter((s) => {
    if (filters.provider && filters.provider !== 'All' && !s.provider.toLowerCase().includes(filters.provider.toLowerCase())) {
      return false;
    }
    if (filters.category && filters.category !== 'All' && s.category !== filters.category) {
      return false;
    }
    if (filters.matchScore && filters.matchScore !== 'All') {
      const min = parseInt(filters.matchScore, 10);
      if (s.matchScore < min) return false;
    }
    if (filters.deadline && filters.deadline !== 'All') {
      if (filters.deadline === 'Rolling' && s.deadline !== 'Rolling') return false;
    }
    return true;
  });
}

export function rankByProfile(
  schemes: SchemeRecommendation[],
  profile: Profile
): SchemeRecommendation[] {
  return [...schemes].sort((a, b) => {
    let boostA = 0;
    let boostB = 0;

    if (profile.state) {
      if (a.eligibility.some((e) => e.toLowerCase().includes(profile.state!.toLowerCase()))) boostA += 5;
      if (b.eligibility.some((e) => e.toLowerCase().includes(profile.state!.toLowerCase()))) boostB += 5;
    }
    if (profile.occupation) {
      if (a.whyRecommended.some((w) => w.toLowerCase().includes(profile.occupation!.toLowerCase()))) boostA += 3;
      if (b.whyRecommended.some((w) => w.toLowerCase().includes(profile.occupation!.toLowerCase()))) boostB += 3;
    }

    return b.matchScore + boostB - (a.matchScore + boostA);
  });
}

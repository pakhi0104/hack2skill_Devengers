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

function buildHeuristicRecommendation(
  result: SearchResultItem,
  category: SchemeCategory,
  profile: Profile,
  answers: CategoryAnswers
): SchemeRecommendation {
  const title = result.title.replace(/\s*-\s*.*/, '').trim();
  const text = `${title} ${result.snippet}`.toLowerCase();
  let score = 58;

  if (category === 'Scholarships') {
    if (text.includes('scholarship')) score += 12;
    if (text.includes('means')) score += 4;
    if (text.includes('merit')) score += 4;
    if (profile.education) score += 3;
  }

  if (category === 'Education Loans') {
    if (text.includes('vidyalaxmi')) score += 16;
    if (text.includes('loan')) score += 8;
    if (text.includes('education')) score += 6;
    if (answers.loanAmount) score += 3;
  }

  if (category === 'Housing') {
    if (text.includes('awas')) score += 10;
    if (text.includes('housing')) score += 8;
    if (text.includes('subsidy')) score += 5;
  }

  if (category === 'Startup') {
    if (text.includes('startup')) score += 10;
    if (text.includes('loan')) score += 6;
    if (text.includes('entrepreneur')) score += 5;
  }

  if (category === 'Agriculture') {
    if (text.includes('kisan')) score += 12;
    if (text.includes('farmer')) score += 8;
    if (text.includes('crop')) score += 4;
  }

  if (category === 'Women Welfare') {
    if (text.includes('women')) score += 10;
    if (text.includes('entrepreneur')) score += 5;
    if (text.includes('welfare')) score += 4;
  }

  if (category === 'Employment') {
    if (text.includes('employment')) score += 8;
    if (text.includes('job')) score += 6;
    if (text.includes('skill')) score += 4;
  }

  if (category === 'Senior Citizen') {
    if (text.includes('pension')) score += 10;
    if (text.includes('senior')) score += 8;
    if (text.includes('retirement')) score += 4;
  }

  if (profile.state && text.includes(profile.state.toLowerCase())) score += 4;
  if (profile.occupation && text.includes(profile.occupation.toLowerCase())) score += 3;
  if (profile.category && profile.category !== 'Prefer not to say' && text.includes(profile.category.toLowerCase())) score += 2;

  const matchScore = Math.min(100, Math.max(60, score));
  const whyRecommended = [
    `Strong match for ${category.toLowerCase()} searches`,
    profile.state ? `Relevant for ${profile.state}` : 'Broadly relevant for your profile',
  ];

  return normalizeRecommendation(
    {
      id: `heuristic-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: title,
      provider: result.source || 'Government of India',
      category,
      matchScore,
      matchLevel: toMatchLevel(matchScore),
      shortDescription: result.snippet.slice(0, 160) || `Scheme relevant to ${category}.`,
      whyRecommended,
      benefits: ['Government support', 'Officially listed scheme'],
      eligibility: ['Eligibility depends on the specific scheme'],
      documents: ['Aadhaar', 'Income proof or supporting documents'],
      officialWebsite: result.url,
      applyLink: result.url,
      verified: true,
      sourceUrl: result.url,
    },
    category
  );
}

export async function analyzeAndRankSchemes(
  category: SchemeCategory,
  profile: Profile,
  answers: CategoryAnswers,
  searchResults: SearchResultItem[]
): Promise<RecommendationResult> {
  if (!isGeminiConfigured) {
    const recommendations = searchResults
      .map((result) => buildHeuristicRecommendation(result, category, profile, answers))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    return {
      recommendations,
      ineligible: [],
      nextSuggestions: [`Check official portals for other ${category.toLowerCase()} options`],
      roadmap: [
        { step: 1, title: 'Check eligibility', description: 'Review official eligibility criteria carefully' },
        { step: 2, title: 'Prepare documents', description: 'Gather Aadhaar, income and education records' },
        { step: 3, title: 'Apply online', description: 'Use the official website listed above' },
      ],
      documentChecklist: ['Aadhaar', 'Income proof', 'Category certificate if applicable'],
      applicationReadiness: 70,
      missingDocuments: ['Income proof'],
      searchSources: searchResults.map((r) => r.source),
      rawSearchCount: searchResults.length,
    };
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

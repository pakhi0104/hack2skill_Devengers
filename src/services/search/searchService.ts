import type { SchemeCategory } from '../../types/schemes';
import type { Profile } from '../../types';
import type { CategoryAnswers, SearchResultItem } from '../../types/schemes';
import { buildSearchQuery } from '../ai/promptTemplates';
import { isGeminiConfigured, searchWithGeminiGrounding } from '../ai/geminiService';

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || '';
const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY || '';

const OFFICIAL_DOMAINS = [
  'myscheme.gov.in',
  'scholarships.gov.in',
  'nsp.gov.in',
  'vidyalakshmi.co.in',
  'india.gov.in',
  'gov.in',
  'sbi.co.in',
  'bankofbaroda.in',
  'canarabank.com',
  'pnbindia.com',
  'unionbankofindia.co.in',
  'centralbankofindia.co.in',
];

function getSourceLabel(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('myscheme')) return 'MyScheme';
  if (lower.includes('scholarships') || lower.includes('nsp')) return 'NSP';
  if (lower.includes('vidyalakshmi')) return 'Vidya Lakshmi';
  if (lower.includes('sbi.co.in')) return 'SBI';
  if (lower.includes('gov.in') || lower.includes('nic.in')) return 'Government Portals';
  return 'Official Source';
}

function isOfficialUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return OFFICIAL_DOMAINS.some((d) => hostname.includes(d.replace('www.', '')));
  } catch {
    return false;
  }
}

async function searchTavily(query: string): Promise<SearchResultItem[]> {
  if (!TAVILY_API_KEY || TAVILY_API_KEY.includes('your-tavily')) return [];

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: `${query} site:gov.in OR site:myscheme.gov.in OR site:sbi.co.in`,
      search_depth: 'advanced',
      include_domains: OFFICIAL_DOMAINS,
      max_results: 10,
      include_answer: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);

  const data = (await res.json()) as {
    results?: { title: string; url: string; content: string }[];
  };

  return (data.results || [])
    .filter((r) => isOfficialUrl(r.url))
    .map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 300) || '',
      source: getSourceLabel(r.url),
    }));
}

async function searchSerper(query: string): Promise<SearchResultItem[]> {
  if (!SERPER_API_KEY || SERPER_API_KEY.includes('your-serper')) return [];

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `${query} site:gov.in OR site:myscheme.gov.in`,
      num: 10,
      gl: 'in',
    }),
  });

  if (!res.ok) throw new Error(`Serper search failed: ${res.status}`);

  const data = (await res.json()) as {
    organic?: { title: string; link: string; snippet: string }[];
  };

  return (data.organic || [])
    .filter((r) => isOfficialUrl(r.link))
    .map((r) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet || '',
      source: getSourceLabel(r.link),
    }));
}

async function searchGeminiGrounding(query: string): Promise<SearchResultItem[]> {
  const { text, sources } = await searchWithGeminiGrounding(query);

  const results: SearchResultItem[] = sources.map((url, i) => ({
    title: `Official Source ${i + 1}`,
    url,
    snippet: text.slice(0, 200),
    source: getSourceLabel(url),
  }));

  // Parse scheme mentions from Gemini text as supplemental results
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const foundUrls = text.match(urlRegex) || [];
  foundUrls.forEach((url) => {
    const clean = url.replace(/[.,;)]+$/, '');
    if (isOfficialUrl(clean) && !results.some((r) => r.url === clean)) {
      results.push({
        title: 'Scheme from official source',
        url: clean,
        snippet: text.slice(0, 250),
        source: getSourceLabel(clean),
      });
    }
  });

  return results;
}

export type SearchProvider = 'gemini' | 'tavily' | 'serper' | 'none';

export function getAvailableSearchProvider(): SearchProvider {
  if (isGeminiConfigured) return 'gemini';
  if (TAVILY_API_KEY && !TAVILY_API_KEY.includes('your-tavily')) return 'tavily';
  if (SERPER_API_KEY && !SERPER_API_KEY.includes('your-serper')) return 'serper';
  return 'none';
}

export async function searchOfficialSources(
  category: SchemeCategory,
  profile: Profile,
  answers: CategoryAnswers
): Promise<{ results: SearchResultItem[]; query: string; provider: SearchProvider }> {
  const query = buildSearchQuery(category, profile, answers);
  const provider = getAvailableSearchProvider();

  if (provider === 'none') {
    // Return empty results - useRecommendation will use mock data
    return { results: [], query, provider };
  }

  let results: SearchResultItem[] = [];

  if (provider === 'gemini') {
    try {
      results = await searchGeminiGrounding(query);
    } catch {
      // Continue to next options
    }
  }

  if (results.length === 0 && (provider === 'tavily' || provider === 'gemini')) {
    try {
      results = await searchTavily(query);
    } catch {
      // try next provider
    }
  }

  if (results.length === 0 && (provider === 'serper' || provider === 'tavily' || provider === 'gemini')) {
    try {
      results = await searchSerper(query);
    } catch {
      // fall through
    }
  }

  return { results, query, provider };
}

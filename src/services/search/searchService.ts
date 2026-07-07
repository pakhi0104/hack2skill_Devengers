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

const FALLBACK_SCHEMES: Record<SchemeCategory, Array<{ title: string; url: string; snippet: string; source: string }>> = {
  Scholarships: [
    {
      title: 'National Scholarship Portal (NSP) – Central Sector Scholarship Scheme',
      url: 'https://scholarships.gov.in/',
      snippet: 'Government scholarships for college and university students, including merit- and need-based schemes.',
      source: 'NSP',
    },
    {
      title: 'National Means-cum-Merit Scholarship',
      url: 'https://scholarships.gov.in/',
      snippet: 'Supports students from economically weaker sections with academic merit and financial need.',
      source: 'NSP',
    },
    {
      title: 'Post Matric Scholarship for OBC Students',
      url: 'https://scholarships.gov.in/',
      snippet: 'Financial assistance for OBC students pursuing education after class 10.',
      source: 'NSP',
    },
    {
      title: 'PM Yasasvi Scholarship',
      url: 'https://scholarships.gov.in/',
      snippet: 'Scholarships for students from OBC, EBC and other eligible categories.',
      source: 'NSP',
    },
  ],
  'Education Loans': [
    {
      title: 'PM Vidyalaxmi Scheme',
      url: 'https://www.vidyalakshmi.co.in/Students/',
      snippet: 'A government-backed education loan portal with access to several banks and interest subsidy options.',
      source: 'Vidya Lakshmi',
    },
    {
      title: 'SBI Scholar Loan',
      url: 'https://sbi.co.in/web/personal-banking/loans/education-loans/sbi-scholar-loan-scheme',
      snippet: 'Education loans from State Bank of India for students studying in India and abroad.',
      source: 'SBI',
    },
    {
      title: 'ICICI Bank Education Loan',
      url: 'https://www.icicibank.com/loans/education-loans',
      snippet: 'Education financing for higher studies, including professional and overseas programs.',
      source: 'ICICI',
    },
    {
      title: 'Canara Bank Vidya Turant',
      url: 'https://www.canarabank.com/',
      snippet: 'Fast-track education loans with simplified processing for eligible students.',
      source: 'Canara Bank',
    },
    {
      title: 'Bank of Baroda Education Loan',
      url: 'https://www.bankofbaroda.in/',
      snippet: 'Education loans covering tuition fees, living expenses and related study costs.',
      source: 'Bank of Baroda',
    },
  ],
  Housing: [
    {
      title: 'Pradhan Mantri Awas Yojana (Urban)',
      url: 'https://pmaymis.gov.in/',
      snippet: 'Affordable housing subsidy for urban families, including first-time home buyers.',
      source: 'PMAY',
    },
    {
      title: 'Pradhan Mantri Awas Yojana (Gramin)',
      url: 'https://pmayg.nic.in/',
      snippet: 'Rural housing support for eligible households and beneficiaries.',
      source: 'PMAY',
    },
    {
      title: 'Credit Linked Subsidy Scheme',
      url: 'https://pmaymis.gov.in/',
      snippet: 'Interest subsidy for eligible home loan borrowers under affordable housing programmes.',
      source: 'PMAY',
    },
    {
      title: 'CLSS for Middle Income Groups',
      url: 'https://pmaymis.gov.in/',
      snippet: 'Subsidy scheme for middle-income households purchasing or constructing homes.',
      source: 'PMAY',
    },
  ],
  Startup: [
    {
      title: 'Standup India Scheme',
      url: 'https://www.standupmitra.in/',
      snippet: 'Bank loans for SC, ST and women entrepreneurs starting new businesses.',
      source: 'Standup India',
    },
    {
      title: 'Startup India Seed Fund Scheme',
      url: 'https://seedfund.startupindia.gov.in/',
      snippet: 'Seed funding support for innovative startups and early-stage ventures.',
      source: 'Startup India',
    },
    {
      title: 'Mudra Loan Scheme',
      url: 'https://www.mudra.org.in/',
      snippet: 'Collateral-free loans for micro and small enterprises across India.',
      source: 'MUDRA',
    },
  ],
  Agriculture: [
    {
      title: 'PM Kisan Samman Nidhi',
      url: 'https://pmkisan.gov.in/',
      snippet: 'Direct income support to small and marginal farmer families.',
      source: 'PM Kisan',
    },
    {
      title: 'Kisan Credit Card',
      url: 'https://www.nabard.org/',
      snippet: 'Working capital loans for farmers and agricultural producers.',
      source: 'NABARD',
    },
    {
      title: 'Pradhan Mantri Fasal Bima Yojana',
      url: 'https://pmfby.gov.in/',
      snippet: 'Crop insurance for farmers against weather and crop failure risks.',
      source: 'PMFBY',
    },
    {
      title: 'PM KUSUM Scheme',
      url: 'https://pmkusum.mnre.gov.in/',
      snippet: 'Solar pump and solar power support for agricultural producers.',
      source: 'MNRE',
    },
  ],
  'Women Welfare': [
    {
      title: 'Mahila E-Haat',
      url: 'https://mahilaehaat-rmk.gov.in/',
      snippet: 'Online marketplace for women entrepreneurs to showcase and sell products.',
      source: 'Ministry of Women and Child Development',
    },
    {
      title: 'Beti Bachao Beti Padhao',
      url: 'https://wcd.nic.in/',
      snippet: 'Programme focused on improving education and welfare outcomes for girls.',
      source: 'WCD',
    },
    {
      title: 'Support to Training and Employment Programme for Women (STEP)',
      url: 'https://wcd.nic.in/',
      snippet: 'Training and employment support for women in various sectors.',
      source: 'WCD',
    },
  ],
  Employment: [
    {
      title: 'Pradhan Mantri Rojgar Protsahan Yojana',
      url: 'https://pmrpy.gov.in/',
      snippet: 'Support for employers hiring first-time workers by subsidising EPF contributions.',
      source: 'Ministry of Labour',
    },
    {
      title: 'National Career Service',
      url: 'https://www.ncs.gov.in/',
      snippet: 'Job matching and career guidance portal for job seekers and employers.',
      source: 'NCS',
    },
    {
      title: 'Skill India Mission',
      url: 'https://www.nsdcindia.org/',
      snippet: 'Skill development programmes for youth, workers and job seekers.',
      source: 'NSDC',
    },
  ],
  'Senior Citizen': [
    {
      title: 'Pradhan Mantri Vaya Vandana Yojana',
      url: 'https://licindia.in/',
      snippet: 'Pension and guaranteed-return investment option for senior citizens.',
      source: 'LIC',
    },
    {
      title: 'Atal Pension Yojana',
      url: 'https://www.atalpensionyojana.gov.in/',
      snippet: 'Affordable pension plan for workers in the unorganised sector.',
      source: 'PFRDA',
    },
    {
      title: 'Senior Citizen Savings Scheme',
      url: 'https://www.postoffice.gov.in/',
      snippet: 'Savings scheme offering regular interest income for senior citizens.',
      source: 'India Post',
    },
  ],
};

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

function dedupeResults(results: SearchResultItem[]): SearchResultItem[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.url}-${result.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getFallbackCatalog(category: SchemeCategory, profile: Profile, answers: CategoryAnswers): SearchResultItem[] {
  const stateHint = profile.state ? ` for ${profile.state}` : '';
  const occupationHint = profile.occupation ? ` for ${profile.occupation}` : '';
  const loanHint = category === 'Education Loans' && answers.loanAmount ? ` up to ${answers.loanAmount}` : '';

  return FALLBACK_SCHEMES[category]
    .map((item) => ({
      title: `${item.title}${stateHint || occupationHint ? ' ' : ''}${stateHint}${occupationHint}${loanHint}`.trim(),
      url: item.url,
      snippet: `${item.snippet} ${stateHint ? `This is relevant for ${profile.state}.` : ''}`.trim(),
      source: item.source,
    }))
    .slice(0, 6);
}

async function searchTavily(query: string): Promise<SearchResultItem[]> {
  if (!TAVILY_API_KEY || TAVILY_API_KEY.includes('your-tavily')) return [];

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query: `${query} official government scheme India`,
      search_depth: 'advanced',
      include_domains: OFFICIAL_DOMAINS,
      max_results: 12,
      include_answer: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);

  const data = (await res.json()) as {
    results?: { title: string; url: string; content: string }[];
  };

  return dedupeResults(
    (data.results || [])
      .filter((r) => isOfficialUrl(r.url))
      .map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.slice(0, 300) || '',
        source: getSourceLabel(r.url),
      }))
  );
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
      q: `${query} official government scheme India`,
      num: 12,
      gl: 'in',
    }),
  });

  if (!res.ok) throw new Error(`Serper search failed: ${res.status}`);

  const data = (await res.json()) as {
    organic?: { title: string; link: string; snippet: string }[];
  };

  return dedupeResults(
    (data.organic || [])
      .filter((r) => isOfficialUrl(r.link))
      .map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet || '',
        source: getSourceLabel(r.link),
      }))
  );
}

async function searchGeminiGrounding(query: string): Promise<SearchResultItem[]> {
  const { text, sources } = await searchWithGeminiGrounding(query);

  const results: SearchResultItem[] = sources.map((url, i) => ({
    title: `Official Source ${i + 1}`,
    url,
    snippet: text.slice(0, 200),
    source: getSourceLabel(url),
  }));

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

  return dedupeResults(results);
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
    return { results: getFallbackCatalog(category, profile, answers), query, provider };
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

  const fallbackResults = getFallbackCatalog(category, profile, answers);
  const combinedResults = dedupeResults([...results, ...fallbackResults]).slice(0, 12);
  return { results: combinedResults, query, provider };
}

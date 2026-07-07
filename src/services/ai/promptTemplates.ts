import type { Profile } from '../../types';
import type { CategoryAnswers, SchemeCategory, SearchResultItem } from '../../types/schemes';

const OFFICIAL_DOMAINS = [
  'myscheme.gov.in',
  'scholarships.gov.in',
  'nsp.gov.in',
  'vidyalakshmi.co.in',
  'india.gov.in',
  'gov.in',
  'nic.in',
  'sbi.co.in',
  'bankofbaroda.in',
  'canarabank.com',
  'pnbindia.in',
  'unionbankofindia.co.in',
  'centralbankofindia.co.in',
];

export const TRUSTED_SOURCE_LABELS = [
  'MyScheme',
  'NSP',
  'Vidya Lakshmi',
  'SBI',
  'Government Portals',
  'India.gov.in',
];

export function buildSearchQuery(category: SchemeCategory, profile: Profile, answers: CategoryAnswers): string {
  const parts = [
    `official government ${category.toLowerCase()} scheme India`,
    profile.state ? `${profile.state} state` : '',
    profile.occupation ? `for ${profile.occupation}` : '',
    profile.education ? profile.education : '',
    profile.category && profile.category !== 'Prefer not to say' ? `${profile.category} category` : '',
  ];

  if (category === 'Scholarships' && answers.cgpa) parts.push(`CGPA ${answers.cgpa}`);
  if (category === 'Education Loans' && answers.loanAmount) parts.push(`loan amount ${answers.loanAmount}`);
  if (category === 'Housing' && answers.areaType) parts.push(answers.areaType);
  if (category === 'Agriculture' && answers.cropType) parts.push(answers.cropType);

  return parts.filter(Boolean).join(' ');
}

export function buildAnalysisPrompt(
  category: SchemeCategory,
  profile: Profile,
  answers: CategoryAnswers,
  searchResults: SearchResultItem[]
): string {
  const profileBlock = JSON.stringify(
    {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      state: profile.state,
      city: profile.city,
      occupation: profile.occupation,
      education: profile.education,
      income_range: profile.income_range,
      social_category: profile.category,
      ...answers,
    },
    null,
    2
  );

  const resultsBlock = searchResults
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSource: ${r.source}\nSnippet: ${r.snippet}`)
    .join('\n\n');

  return `You are SchemeMatch AI — an intelligent Indian government benefits advisor.

STRICT RULES:
- NEVER invent scheme names, deadlines, interest rates, eligibility rules, or official links.
- Only recommend schemes found in the SEARCH RESULTS below.
- If a field cannot be verified from search results, set verified=false and use "Unable to verify from official sources" for that field.
- Prioritize sources from: ${OFFICIAL_DOMAINS.join(', ')}
- Rank schemes by eligibility match with the user profile.
- Explain recommendations in simple, friendly language — avoid heavy government jargon.
- Include at least 3 alternatives if user is ineligible for top schemes.

USER PROFILE + CATEGORY ANSWERS:
${profileBlock}

CATEGORY: ${category}

SEARCH RESULTS (official sources only):
${resultsBlock || 'No search results available.'}

Respond with ONLY valid JSON (no markdown fences) matching this exact structure:
{
  "recommendations": [
    {
      "id": "unique-slug",
      "name": "Scheme Name from search",
      "provider": "Ministry/Bank name",
      "category": "${category}",
      "matchScore": 85,
      "matchLevel": "High Match",
      "shortDescription": "1-2 sentence plain language summary",
      "whyRecommended": ["✔ reason 1", "✔ reason 2"],
      "benefits": ["benefit 1"],
      "eligibility": ["eligibility rule 1"],
      "documents": ["Aadhaar", "Income Certificate"],
      "interestRate": "rate or Unable to verify from official sources",
      "processingTime": "time or Unable to verify from official sources",
      "deadline": "date or Rolling or Unable to verify from official sources",
      "officialWebsite": "URL from search results",
      "applyLink": "apply URL if found",
      "importantInfo": ["info"],
      "faqs": [{"question": "Q?", "answer": "A"}],
      "aiSummary": "Plain language overview",
      "aiRecommendation": "Why this is the best pick for this user",
      "whyBetter": "Why better than alternatives",
      "approvalProbability": "High/Medium/Low with brief reason",
      "verified": true,
      "sourceUrl": "source URL"
    }
  ],
  "ineligible": [
    {
      "name": "Scheme name",
      "provider": "Provider",
      "whyNotEligible": ["Income exceeds eligibility"],
      "alternatives": ["Alternative scheme 1"]
    }
  ],
  "nextSuggestions": ["You may also qualify for..."],
  "roadmap": [
    {"step": 1, "title": "Collect Aadhaar", "description": "Get self-attested copy"}
  ],
  "documentChecklist": ["Aadhaar", "PAN", "Income Certificate"],
  "applicationReadiness": 75,
  "missingDocuments": ["Income Certificate"],
  "searchSources": ["MyScheme", "NSP"]
}

Return 4-8 recommendations ranked by match score. matchLevel: 80+ = "High Match", 60-79 = "Medium Match", below 60 = "Low Match".`;
}

export function buildComparisonPrompt(schemes: { name: string; data: string }[]): string {
  return `Compare these government schemes for an Indian citizen. Use ONLY the provided data. Do not invent fields.

${schemes.map((s, i) => `SCHEME ${i + 1}: ${s.name}\n${s.data}`).join('\n\n')}

Return ONLY valid JSON array with objects: schemeId, name, provider, benefits, eligibility, documents, interestRate, processingTime, deadline, officialWebsite, matchScore, recommendation (1 sentence). Highlight best scheme in recommendation field.`;
}

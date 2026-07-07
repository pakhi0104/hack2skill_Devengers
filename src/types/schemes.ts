/** Browse / scheme domain categories (distinct from social reservation category) */
export type SchemeCategory =
  | 'Scholarships'
  | 'Education Loans'
  | 'Housing'
  | 'Startup'
  | 'Agriculture'
  | 'Women Welfare'
  | 'Employment'
  | 'Senior Citizen';

export type MatchLevel = 'High Match' | 'Medium Match' | 'Low Match';

export interface CategoryAnswers {
  // Scholarships
  currentYear?: string;
  cgpa?: string;
  disabilityStatus?: string;
  // Education Loans
  loanAmount?: string;
  existingLoans?: string;
  coApplicant?: string;
  collateral?: string;
  creditScore?: string;
  repaymentPeriod?: string;
  // Startup
  businessType?: string;
  investmentNeeded?: string;
  existingBusiness?: string;
  yearsOfExperience?: string;
  // Housing
  areaType?: string;
  firstHouse?: string;
  propertyCost?: string;
  // Agriculture
  landSize?: string;
  cropType?: string;
  irrigationType?: string;
  // Employment
  employmentStatus?: string;
  skills?: string;
  experience?: string;
}

export interface SchemeRecommendation {
  id: string;
  name: string;
  provider: string;
  category: SchemeCategory;
  matchScore: number;
  matchLevel: MatchLevel;
  shortDescription: string;
  whyRecommended: string[];
  benefits: string[];
  eligibility: string[];
  documents: string[];
  interestRate?: string;
  processingTime?: string;
  deadline?: string;
  officialWebsite: string;
  applyLink?: string;
  importantInfo?: string[];
  faqs?: { question: string; answer: string }[];
  aiSummary?: string;
  aiRecommendation?: string;
  whyBetter?: string;
  approvalProbability?: string;
  verified: boolean;
  sourceUrl?: string;
}

export interface IneligibleScheme {
  name: string;
  provider: string;
  whyNotEligible: string[];
  alternatives?: string[];
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
}

export interface RecommendationResult {
  recommendations: SchemeRecommendation[];
  ineligible: IneligibleScheme[];
  nextSuggestions: string[];
  roadmap: RoadmapStep[];
  documentChecklist: string[];
  applicationReadiness: number;
  missingDocuments: string[];
  searchSources: string[];
  rawSearchCount: number;
}

export interface CompareRow {
  schemeId: string;
  name: string;
  provider: string;
  benefits: string;
  eligibility: string;
  documents: string;
  interestRate: string;
  processingTime: string;
  deadline: string;
  officialWebsite: string;
  matchScore: number;
  recommendation: string;
}

export interface SearchHistoryEntry {
  id: string;
  user_id: string;
  category: string;
  query: string;
  extra_answers?: CategoryAnswers;
  results_count?: number;
  created_at: string;
}

export interface SearchFilters {
  provider: string;
  state: string;
  interestRate: string;
  category: string;
  deadline: string;
  eligibility: string;
  matchScore: string;
}

export type AILoadingStage =
  | 'profile'
  | 'searching'
  | 'analyzing'
  | 'comparing'
  | 'roadmap'
  | 'complete';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

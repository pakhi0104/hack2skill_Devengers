import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type {
  CategoryAnswers,
  RecommendationResult,
  SchemeCategory,
  AILoadingStage,
  SchemeRecommendation,
} from '../types/schemes';
import { searchOfficialSources, getAvailableSearchProvider } from '../services/search/searchService';
import { analyzeAndRankSchemes } from '../services/ai/recommendationEngine';
import { saveSearchHistory } from '../services/searchHistoryService';
import { TRUSTED_SOURCE_LABELS } from '../services/ai/promptTemplates';

const LOADING_MESSAGES: Record<AILoadingStage, string> = {
  profile: 'Understanding your profile...',
  searching: 'Searching official websites...',
  analyzing: 'AI analyzing schemes...',
  comparing: 'Comparing schemes...',
  roadmap: 'Generating roadmap...',
  complete: 'Preparing recommendations...',
};

// Broader fallback data for when searches are unavailable or rate-limited
function getMockRecommendations(category: SchemeCategory): RecommendationResult {
  const mockSchemes: Record<SchemeCategory, SchemeRecommendation[]> = {
    Scholarships: [
      {
        id: 'mock-scholarship-1',
        name: 'Central Sector Scholarship Scheme',
        provider: 'Department of Higher Education',
        category: 'Scholarships',
        matchScore: 86,
        matchLevel: 'High Match',
        shortDescription: 'Merit-based scholarship for college and university students.',
        whyRecommended: ['Your academic profile matches the eligibility', 'Your state is covered'],
        benefits: ['₹12,000 per year', 'Renewable for up to 5 years'],
        eligibility: ['Indian citizen', '80%+ marks in 12th standard', 'Family income < ₹8 lakh/year'],
        documents: ['12th Marksheet', 'Income Certificate', 'Aadhaar Card', 'Bank Passbook'],
        officialWebsite: 'https://scholarships.gov.in',
        applyLink: 'https://scholarships.gov.in',
        verified: true,
      },
      {
        id: 'mock-scholarship-2',
        name: 'Post Matric Scholarship for OBC Students',
        provider: 'Ministry of Social Justice',
        category: 'Scholarships',
        matchScore: 74,
        matchLevel: 'Medium Match',
        shortDescription: 'Financial assistance for OBC students studying beyond class 10.',
        whyRecommended: ['Your category matches the scheme', 'Eligible for post-matric studies'],
        benefits: ['Tuition fee waiver', 'Maintenance allowance up to ₹1,200/month'],
        eligibility: ['OBC category', 'Post-matric level studies'],
        documents: ['Caste Certificate', 'Aadhaar Card', 'Admission Letter'],
        officialWebsite: 'https://scholarships.gov.in',
        verified: true,
      },
      {
        id: 'mock-scholarship-3',
        name: 'National Means Cum Merit Scholarship',
        provider: 'Ministry of Education',
        category: 'Scholarships',
        matchScore: 72,
        matchLevel: 'Medium Match',
        shortDescription: 'Supports academically strong students from economically weaker families.',
        whyRecommended: ['Good fit for lower-income students', 'Open to meritorious students'],
        benefits: ['Monthly scholarship support', 'Covers school or college fees'],
        eligibility: ['Merit-based', 'Family income threshold'],
        documents: ['Income Certificate', 'Academic records', 'Aadhaar Card'],
        officialWebsite: 'https://scholarships.gov.in',
        verified: true,
      },
    ],
    'Education Loans': [
      {
        id: 'mock-loan-1',
        name: 'PM Vidyalaxmi Scheme',
        provider: 'Vidya Lakshmi Portal',
        category: 'Education Loans',
        matchScore: 92,
        matchLevel: 'High Match',
        shortDescription: 'Government-backed student loan portal with access to multiple banks and subsidy options.',
        whyRecommended: ['Strong fit for education loan seekers', 'Broad bank coverage'],
        benefits: ['Access to multiple lenders', 'Simplified application'],
        eligibility: ['Indian student', 'Admission to recognised course'],
        documents: ['Admission Letter', 'Aadhaar Card', 'Pan Card'],
        interestRate: 'Varies by lender',
        officialWebsite: 'https://www.vidyalakshmi.co.in/Students/',
        verified: true,
      },
      {
        id: 'mock-loan-2',
        name: 'SBI Scholar Loan',
        provider: 'State Bank of India',
        category: 'Education Loans',
        matchScore: 88,
        matchLevel: 'High Match',
        shortDescription: 'Education loan for students pursuing higher studies in India and abroad.',
        whyRecommended: ['Looking for education loan', 'Your profile meets eligibility'],
        benefits: ['Up to ₹40 lakh loan', 'Moratorium available'],
        eligibility: ['Admission to recognised institutions', 'Co-applicant required'],
        documents: ['Admission Letter', 'Aadhaar Card', 'PAN Card', 'Co-applicant documents'],
        interestRate: '10.00% p.a.',
        processingTime: '7-10 days',
        officialWebsite: 'https://sbi.co.in/web/personal-banking/loans/education-loans/sbi-scholar-loan-scheme',
        verified: true,
      },
      {
        id: 'mock-loan-3',
        name: 'ICICI Bank Education Loan',
        provider: 'ICICI Bank',
        category: 'Education Loans',
        matchScore: 80,
        matchLevel: 'High Match',
        shortDescription: 'Flexible education financing for professional and overseas studies.',
        whyRecommended: ['Good fit for higher studies', 'Multiple repayment options'],
        benefits: ['Competitive interest rates', 'Covers tuition and living costs'],
        eligibility: ['Eligible student applicant', 'Admission proof required'],
        documents: ['Admission Letter', 'KYC documents', 'Fee structure'],
        officialWebsite: 'https://www.icicibank.com/loans/education-loans',
        verified: true,
      },
      {
        id: 'mock-loan-4',
        name: 'Canara Bank Vidya Turant',
        provider: 'Canara Bank',
        category: 'Education Loans',
        matchScore: 76,
        matchLevel: 'Medium Match',
        shortDescription: 'Quick education loan for higher studies in India and abroad.',
        whyRecommended: ['Your academic profile fits'],
        benefits: ['Up to ₹20 lakh', 'Simplified documentation'],
        eligibility: ['Indian citizen', 'Secured admission'],
        documents: ['Admission Letter', 'Marksheets', 'Aadhaar Card'],
        interestRate: '10.25% p.a.',
        officialWebsite: 'https://canarabank.com',
        verified: true,
      },
    ],
    Housing: [
      {
        id: 'mock-housing-1',
        name: 'Pradhan Mantri Awas Yojana (Urban)',
        provider: 'Ministry of Housing and Urban Affairs',
        category: 'Housing',
        matchScore: 84,
        matchLevel: 'High Match',
        shortDescription: 'Affordable housing with interest subsidy for urban areas.',
        whyRecommended: ['Your income bracket fits', 'First-time home buyer'],
        benefits: ['Interest subsidy up to 6.5%', 'Subsidy amount up to ₹2.67 lakh'],
        eligibility: ['Urban resident', 'Family income up to ₹18 lakh/year'],
        documents: ['Aadhaar Card', 'Income Certificate', 'Property documents'],
        officialWebsite: 'https://pmaymis.gov.in',
        verified: true,
      },
      {
        id: 'mock-housing-2',
        name: 'Pradhan Mantri Awas Yojana (Gramin)',
        provider: 'Ministry of Rural Development',
        category: 'Housing',
        matchScore: 78,
        matchLevel: 'Medium Match',
        shortDescription: 'Housing support for rural households and beneficiaries.',
        whyRecommended: ['Good fit for rural applicants', 'Supports affordable housing'],
        benefits: ['Financial assistance', 'Construction support'],
        eligibility: ['Rural household', 'Eligible beneficiary'],
        documents: ['Aadhaar Card', 'Income proof', 'Land documents'],
        officialWebsite: 'https://pmayg.nic.in',
        verified: true,
      },
    ],
    Startup: [
      {
        id: 'mock-startup-1',
        name: 'Standup India Scheme',
        provider: 'Department of Financial Services',
        category: 'Startup',
        matchScore: 82,
        matchLevel: 'High Match',
        shortDescription: 'Bank loan between ₹10 lakh to ₹1 crore for SC/ST/Women entrepreneurs.',
        whyRecommended: ['Startup-focused', 'Your category may be eligible'],
        benefits: ['Term loan for greenfield project', 'Collateral free under CGTSME'],
        eligibility: ['SC/ST or Woman entrepreneur', 'Age 18+'],
        documents: ['Project report', 'Aadhaar Card', 'PAN Card'],
        officialWebsite: 'https://standupmitra.in',
        verified: true,
      },
      {
        id: 'mock-startup-2',
        name: 'Startup India Seed Fund Scheme',
        provider: 'Startup India',
        category: 'Startup',
        matchScore: 76,
        matchLevel: 'Medium Match',
        shortDescription: 'Seed funding support for innovative early-stage startups.',
        whyRecommended: ['Good fit for new ventures', 'Supports prototype development'],
        benefits: ['Seed funding', 'Mentorship support'],
        eligibility: ['Recognised startup', 'Early-stage venture'],
        documents: ['Startup certificate', 'Business plan', 'KYC'],
        officialWebsite: 'https://seedfund.startupindia.gov.in',
        verified: true,
      },
    ],
    Agriculture: [
      {
        id: 'mock-agri-1',
        name: 'PM Kisan Samman Nidhi',
        provider: 'Ministry of Agriculture and Farmers Welfare',
        category: 'Agriculture',
        matchScore: 90,
        matchLevel: 'High Match',
        shortDescription: 'Income support of ₹6,000 per year to farmer families.',
        whyRecommended: ['Farmer occupation', 'Your profile fits perfectly'],
        benefits: ['₹6,000 per year in 3 installments'],
        eligibility: ['Landholding farmer family'],
        documents: ['Land records', 'Aadhaar Card', 'Bank details'],
        officialWebsite: 'https://pmkisan.gov.in',
        verified: true,
      },
      {
        id: 'mock-agri-2',
        name: 'Pradhan Mantri Fasal Bima Yojana',
        provider: 'Ministry of Agriculture',
        category: 'Agriculture',
        matchScore: 81,
        matchLevel: 'High Match',
        shortDescription: 'Crop insurance for farmers against weather and crop loss.',
        whyRecommended: ['Useful for crop-based risk coverage', 'Farmer support'],
        benefits: ['Premium subsidy', 'Crop loss coverage'],
        eligibility: ['Registered farmer', 'Insurable crop'],
        documents: ['Farmer ID', 'Land records', 'Crop details'],
        officialWebsite: 'https://pmfby.gov.in',
        verified: true,
      },
    ],
    'Women Welfare': [
      {
        id: 'mock-women-1',
        name: 'Mahila E-Haat',
        provider: 'Ministry of Women and Child Development',
        category: 'Women Welfare',
        matchScore: 85,
        matchLevel: 'High Match',
        shortDescription: 'Online marketplace for women entrepreneurs.',
        whyRecommended: ['Woman-owned business or aspiring entrepreneur'],
        benefits: ['Free online platform', 'Pan-India visibility'],
        eligibility: ['Woman entrepreneur (18+)', 'Product/service offering'],
        documents: ['Aadhaar Card', 'PAN Card', 'Business details'],
        officialWebsite: 'https://mahilaehaat-rmk.gov.in',
        verified: true,
      },
      {
        id: 'mock-women-2',
        name: 'Beti Bachao Beti Padhao',
        provider: 'Women and Child Development',
        category: 'Women Welfare',
        matchScore: 77,
        matchLevel: 'Medium Match',
        shortDescription: 'Programme focused on improving girl child education and welfare.',
        whyRecommended: ['Good fit for girl child welfare support', 'Focus on education'],
        benefits: ['Education support', 'Awareness and outreach'],
        eligibility: ['Girls and families in target geographies'],
        documents: ['Aadhaar Card', 'Residence proof'],
        officialWebsite: 'https://wcd.nic.in',
        verified: true,
      },
    ],
    Employment: [
      {
        id: 'mock-employment-1',
        name: 'Pradhan Mantri Rojgar Protsahan Yojana',
        provider: 'Ministry of Labour and Employment',
        category: 'Employment',
        matchScore: 78,
        matchLevel: 'Medium Match',
        shortDescription: 'Employer contribution to EPF for new employees for first 3 years.',
        whyRecommended: ['Looking for employment or newly employed'],
        benefits: ['Government pays employer\'s EPF contribution'],
        eligibility: ['New employee earning < ₹15,000/month', 'Working in eligible establishment'],
        documents: ['Aadhaar Card', 'UAN', 'Employment details'],
        officialWebsite: 'https://pmrpy.gov.in',
        verified: true,
      },
      {
        id: 'mock-employment-2',
        name: 'Skill India Mission',
        provider: 'NSDC',
        category: 'Employment',
        matchScore: 74,
        matchLevel: 'Medium Match',
        shortDescription: 'Skill-based training programmes for youth and job seekers.',
        whyRecommended: ['Useful for upskilling and employment'],
        benefits: ['Training support', 'Job readiness'],
        eligibility: ['Youth or job seekers'],
        documents: ['Aadhaar Card', 'Education proof'],
        officialWebsite: 'https://www.nsdcindia.org',
        verified: true,
      },
    ],
    'Senior Citizen': [
      {
        id: 'mock-senior-1',
        name: 'Pradhan Mantri Vaya Vandana Yojana',
        provider: 'LIC of India',
        category: 'Senior Citizen',
        matchScore: 92,
        matchLevel: 'High Match',
        shortDescription: 'Pension scheme for senior citizens with guaranteed returns.',
        whyRecommended: ['Senior citizen', 'Looking for secure investment'],
        benefits: ['Guaranteed 7.40% p.a. return', 'Pension for 10 years', 'Maximum investment ₹15 lakh'],
        eligibility: ['Age 60+'],
        documents: ['Age proof', 'Aadhaar Card', 'PAN Card', 'Bank details'],
        officialWebsite: 'https://licindia.in',
        verified: true,
      },
      {
        id: 'mock-senior-2',
        name: 'Atal Pension Yojana',
        provider: 'PFRDA',
        category: 'Senior Citizen',
        matchScore: 85,
        matchLevel: 'High Match',
        shortDescription: 'Affordable pension scheme for workers in the unorganised sector.',
        whyRecommended: ['Good fit for long-term retirement planning'],
        benefits: ['Guaranteed pension', 'Low contribution'],
        eligibility: ['Age 18-40', 'Eligible subscriber'],
        documents: ['Aadhaar Card', 'Bank details', 'Mobile number'],
        officialWebsite: 'https://www.atalpensionyojana.gov.in',
        verified: true,
      },
    ],
  };

  const recommendations = mockSchemes[category] || [
    {
      id: 'mock-generic-1',
      name: 'Government Scheme Sample',
      provider: 'Government of India',
      category,
      matchScore: 70,
      matchLevel: 'Medium Match',
      shortDescription: 'Sample government scheme for demonstration purposes.',
      whyRecommended: ['Your profile matches general eligibility'],
      benefits: ['Benefit 1', 'Benefit 2'],
      eligibility: ['Indian citizen', 'Other general criteria'],
      documents: ['Aadhaar Card'],
      officialWebsite: 'https://india.gov.in',
      verified: true,
    },
  ];

  return {
    recommendations,
    ineligible: [],
    nextSuggestions: [],
    roadmap: [
      { step: 1, title: 'Check eligibility', description: 'Review eligibility criteria carefully' },
      { step: 2, title: 'Gather documents', description: 'Collect all required documents' },
      { step: 3, title: 'Apply online', description: 'Submit application via official portal' },
    ],
    documentChecklist: recommendations[0]?.documents || [],
    applicationReadiness: 0,
    missingDocuments: recommendations[0]?.documents || [],
    searchSources: ['Expanded fallback catalog'],
    rawSearchCount: recommendations.length,
  };
}

export function useRecommendations() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<AILoadingStage>('profile');
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runRecommendation = useCallback(
    async (category: SchemeCategory, answers: CategoryAnswers) => {
      if (!profile) {
        setError('Profile not loaded. Please complete your profile first.');
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setStage('profile');
      setActiveSources([]);

      try {
        await new Promise((r) => setTimeout(r, 600));
        setStage('searching');

        // Animate through trusted sources
        for (const source of TRUSTED_SOURCE_LABELS) {
          setActiveSources((prev) => [...prev, source]);
          await new Promise((r) => setTimeout(r, 400));
        }

        let recommendationResult: RecommendationResult;
        const provider = getAvailableSearchProvider();

        try {
          const { results, query } = await searchOfficialSources(category, profile, answers);

          setStage('analyzing');
          await new Promise((r) => setTimeout(r, 500));

          setStage('comparing');
          recommendationResult = await analyzeAndRankSchemes(category, profile, answers, results);

          if (user?.id) {
            await saveSearchHistory(
              user.id,
              category,
              query,
              answers,
              recommendationResult.recommendations.length,
              `${recommendationResult.recommendations.length} schemes found`
            );
          }
        } catch (searchErr) {
          console.warn('Search/AI failed, using expanded fallback data:', searchErr);
          recommendationResult = getMockRecommendations(category);
        }

        setStage('roadmap');
        await new Promise((r) => setTimeout(r, 400));

        setStage('complete');
        setResult(recommendationResult);

        // Save search history for mock data too
        if (provider === 'none' && user?.id) {
          await saveSearchHistory(
            user.id,
            category,
            `${category} schemes for ${profile.occupation}`,
            answers,
            recommendationResult.recommendations.length,
            `${recommendationResult.recommendations.length} mock schemes shown`
          );
        }

        return recommendationResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to fetch schemes.';
        // Even if something goes wrong, try to show mock data
        try {
          const mockResult = getMockRecommendations(category);
          setResult(mockResult);
          return mockResult;
        } catch {
          setError(message);
          return null;
        }
      } finally {
        setLoading(false);
      }
    },
    [profile, user]
  );

  const retry = useCallback(
    (category: SchemeCategory, answers: CategoryAnswers) => {
      return runRecommendation(category, answers);
    },
    [runRecommendation]
  );

  return {
    loading,
    stage,
    loadingMessage: LOADING_MESSAGES[stage],
    activeSources,
    result,
    error,
    runRecommendation,
    retry,
    setResult,
  };
}

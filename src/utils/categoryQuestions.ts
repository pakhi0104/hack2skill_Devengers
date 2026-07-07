import type { Profile } from '../types';
import type { CategoryAnswers, SchemeCategory } from '../types/schemes';

export interface QuestionField {
  key: keyof CategoryAnswers;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  optional?: boolean;
  placeholder?: string;
}

/** Profile fields the AI already knows — never re-ask */
const PROFILE_COVERED = ['age', 'state', 'city', 'occupation', 'education', 'income_range', 'category', 'gender'] as const;

const CATEGORY_QUESTIONS: Record<SchemeCategory, QuestionField[]> = {
  Scholarships: [
    { key: 'currentYear', label: 'Current Year of Study', type: 'select', options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'] },
    { key: 'cgpa', label: 'Current CGPA / Percentage', type: 'text', placeholder: 'e.g. 8.5 or 85%' },
    { key: 'disabilityStatus', label: 'Disability Status', type: 'select', options: ['No', 'Yes — PwD Category', 'Prefer not to say'], optional: true },
  ],
  'Education Loans': [
    { key: 'loanAmount', label: 'Required Loan Amount', type: 'text', placeholder: 'e.g. ₹5,00,000' },
    { key: 'existingLoans', label: 'Existing Loans', type: 'select', options: ['None', 'Education Loan', 'Home Loan', 'Personal Loan', 'Other'] },
    { key: 'coApplicant', label: 'Co-applicant Available', type: 'select', options: ['Yes', 'No'] },
    { key: 'collateral', label: 'Collateral Available', type: 'select', options: ['Yes', 'No', 'Not Sure'] },
    { key: 'creditScore', label: 'Credit Score (Optional)', type: 'text', placeholder: 'e.g. 750', optional: true },
    { key: 'repaymentPeriod', label: 'Preferred Repayment Period (Optional)', type: 'select', options: ['5 years', '7 years', '10 years', '15 years'], optional: true },
  ],
  Startup: [
    { key: 'businessType', label: 'Business Type', type: 'select', options: ['Technology', 'Manufacturing', 'Agriculture', 'Services', 'Retail', 'Other'] },
    { key: 'investmentNeeded', label: 'Investment Needed', type: 'text', placeholder: 'e.g. ₹10,00,000' },
    { key: 'existingBusiness', label: 'Existing Business?', type: 'select', options: ['Yes — Running', 'Yes — Idea Stage', 'No — Planning to Start'] },
    { key: 'yearsOfExperience', label: 'Years of Experience', type: 'select', options: ['0-1', '1-3', '3-5', '5+'] },
  ],
  Housing: [
    { key: 'areaType', label: 'Rural or Urban', type: 'select', options: ['Rural', 'Urban', 'Semi-Urban'] },
    { key: 'firstHouse', label: 'First House?', type: 'select', options: ['Yes', 'No'] },
    { key: 'propertyCost', label: 'Estimated Property Cost', type: 'text', placeholder: 'e.g. ₹25,00,000' },
  ],
  Agriculture: [
    { key: 'landSize', label: 'Land Size (in acres/hectares)', type: 'text', placeholder: 'e.g. 2 acres' },
    { key: 'cropType', label: 'Crop Type', type: 'text', placeholder: 'e.g. Wheat, Rice, Cotton' },
    { key: 'irrigationType', label: 'Irrigation Type', type: 'select', options: ['Canal', 'Borewell', 'Rain-fed', 'Drip Irrigation', 'Other'] },
  ],
  Employment: [
    { key: 'employmentStatus', label: 'Employment Status', type: 'select', options: ['Unemployed', 'Employed', 'Self-Employed', 'Student'] },
    { key: 'skills', label: 'Key Skills', type: 'text', placeholder: 'e.g. Data Entry, Tailoring, Coding' },
    { key: 'experience', label: 'Years of Experience', type: 'select', options: ['Fresher', '1-2 years', '3-5 years', '5+ years'] },
  ],
  'Women Welfare': [
    { key: 'employmentStatus', label: 'Employment Status', type: 'select', options: ['Homemaker', 'Employed', 'Self-Employed', 'Student', 'Unemployed'] },
    { key: 'skills', label: 'Skills / Interests (Optional)', type: 'text', placeholder: 'e.g. Handicrafts, Tailoring', optional: true },
  ],
  'Senior Citizen': [
    { key: 'employmentStatus', label: 'Current Status', type: 'select', options: ['Retired', 'Pensioner', 'Homemaker', 'Still Working'] },
    { key: 'disabilityStatus', label: 'Disability / Medical Needs (Optional)', type: 'select', options: ['None', 'Yes', 'Prefer not to say'], optional: true },
  ],
};

export function getQuestionsForCategory(category: SchemeCategory): QuestionField[] {
  return CATEGORY_QUESTIONS[category] || [];
}

export function getMissingQuestions(
  category: SchemeCategory,
  _profile: Profile | null,
  existingAnswers: CategoryAnswers
): QuestionField[] {
  const allQuestions = getQuestionsForCategory(category);

  return allQuestions.filter((q) => {
    // Skip if already answered in this session
    if (existingAnswers[q.key]) return false;
    return true;
  });
}

export function getProfileSummaryForAI(profile: Profile | null): Record<string, string | number | undefined> {
  if (!profile) return {};
  return {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    state: profile.state,
    city: profile.city,
    occupation: profile.occupation,
    education: profile.education,
    income_range: profile.income_range,
    social_category: profile.category,
  };
}

export function hasCompleteProfileForCategory(profile: Profile | null): boolean {
  if (!profile) return false;
  return !!(profile.age && profile.state && profile.occupation && profile.education && profile.income_range);
}

export { PROFILE_COVERED };

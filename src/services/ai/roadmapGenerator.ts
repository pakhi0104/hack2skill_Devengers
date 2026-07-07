import type { RoadmapStep, SchemeRecommendation } from '../../types/schemes';
import { generateWithGemini, parseGeminiJson, isGeminiConfigured } from './geminiService';

const DEFAULT_ROADMAP: RoadmapStep[] = [
  { step: 1, title: 'Collect Aadhaar', description: 'Get a self-attested copy of your Aadhaar card.' },
  { step: 2, title: 'Collect Income Certificate', description: 'Obtain an income certificate from your local authority.' },
  { step: 3, title: 'Visit Official Website', description: 'Open the scheme portal and create an account if required.' },
  { step: 4, title: 'Fill Application', description: 'Complete the online application form with accurate details.' },
  { step: 5, title: 'Upload Documents', description: 'Upload all required documents in the specified format.' },
  { step: 6, title: 'Track Status', description: 'Save your application reference number and track progress.' },
];

const DEFAULT_CHECKLIST = [
  'Aadhaar',
  'PAN',
  'Income Certificate',
  'Domicile Certificate',
  'Passport Photograph',
  'Bank Account Details',
];

export async function generateRoadmap(scheme: SchemeRecommendation): Promise<RoadmapStep[]> {
  if (!isGeminiConfigured) {
    return DEFAULT_ROADMAP;
  }

  try {
    const prompt = `Generate a step-by-step application roadmap for the Indian government scheme "${scheme.name}" by ${scheme.provider}.
Use ONLY this verified data: ${JSON.stringify({ documents: scheme.documents, eligibility: scheme.eligibility, applyLink: scheme.applyLink })}
Do not invent steps. Return ONLY JSON array: [{"step":1,"title":"...","description":"..."}]`;

    const text = await generateWithGemini(prompt);
    const steps = parseGeminiJson<RoadmapStep[]>(text);
    return steps.length > 0 ? steps : DEFAULT_ROADMAP;
  } catch {
    return DEFAULT_ROADMAP;
  }
}

export function generateDocumentChecklist(
  scheme: SchemeRecommendation,
  existingDocs: string[] = []
): { checklist: string[]; readiness: number; missing: string[] } {
  const checklist = scheme.documents.length > 0 ? scheme.documents : DEFAULT_CHECKLIST;
  const missing = checklist.filter(
    (doc) => !existingDocs.some((d) => d.toLowerCase() === doc.toLowerCase())
  );
  const checked = checklist.length - missing.length;
  const readiness = checklist.length > 0 ? Math.round((checked / checklist.length) * 100) : 0;

  return { checklist, readiness, missing };
}

export function isReadyToApply(readiness: number): boolean {
  return readiness >= 100;
}

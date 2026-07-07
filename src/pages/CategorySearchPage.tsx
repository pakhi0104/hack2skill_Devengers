import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecommendations } from '../hooks/useRecommendations';
import { useRecommendationContext } from '../contexts/RecommendationContext';
import { AppLayout } from '../components/layout/AppLayout';
import { DynamicQuestionsForm } from '../components/recommendations/DynamicQuestionsForm';
import { AILoadingScreen } from '../components/recommendations/AILoadingScreen';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { SearchFilters } from '../components/recommendations/SearchFilters';
import { SearchError } from '../components/recommendations/SearchError';
import { WhyNotEligible } from '../components/recommendations/WhyNotEligible';
import { DocumentChecklist } from '../components/recommendations/DocumentChecklist';
import { RoadmapTimeline } from '../components/recommendations/RoadmapTimeline';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getQuestionsForCategory } from '../utils/categoryQuestions';
import { filterRecommendations } from '../services/ai/recommendationEngine';
import type { CategoryAnswers, SchemeCategory, SearchFilters as Filters } from '../types/schemes';
import { ArrowLeft, GitCompare, Sparkles, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const VALID_CATEGORIES: SchemeCategory[] = [
  'Scholarships', 'Education Loans', 'Housing', 'Startup',
  'Agriculture', 'Women Welfare', 'Employment', 'Senior Citizen',
];

export const CategorySearchPage: React.FC = () => {
  const { category: categoryParam } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { setLastResult, compareList } = useRecommendationContext();
  const { loading, stage, loadingMessage, activeSources, result, error, runRecommendation, retry } =
    useRecommendations();

  const category = decodeURIComponent(categoryParam || '') as SchemeCategory;
  const isValidCategory = VALID_CATEGORIES.includes(category);

  const [step, setStep] = useState<'questions' | 'loading' | 'results'>('questions');
  const [answers, setAnswers] = useState<CategoryAnswers>({});
  const [filters, setFilters] = useState<Filters>({
    provider: 'All',
    state: 'All',
    interestRate: 'All',
    category: 'All',
    deadline: 'All',
    eligibility: 'All',
    matchScore: 'All',
  });

  const questions = useMemo(
    () => (isValidCategory ? getQuestionsForCategory(category) : []),
    [category, isValidCategory]
  );

  useEffect(() => {
    if (result) {
      setLastResult(result);
      setStep('results');
    }
  }, [result, setLastResult]);

  useEffect(() => {
    if (loading) setStep('loading');
  }, [loading]);

  const handleSubmit = async () => {
    if (!isValidCategory) return;
    setStep('loading');
    await runRecommendation(category, answers);
  };

  const filteredSchemes = useMemo(() => {
    if (!result) return [];
    return filterRecommendations(result.recommendations, filters);
  }, [result, filters]);

  const providers = useMemo(() => {
    if (!result) return [];
    return [...new Set(result.recommendations.map((s) => s.provider))];
  }, [result]);

  if (!isValidCategory) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto py-20 text-center px-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invalid Category</h2>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={step === 'results'}>
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          {compareList.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/compare')}
              leftIcon={<GitCompare className="w-4 h-4" />}
            >
              Compare ({compareList.length})
            </Button>
          )}
        </div>

        {step === 'questions' && !loading && (
          <DynamicQuestionsForm
            category={category}
            profile={profile}
            questions={questions}
            answers={answers}
            onChange={setAnswers}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        )}

        {step === 'loading' && (
          <AILoadingScreen stage={stage} message={loadingMessage} activeSources={activeSources} />
        )}

        {error && !loading && (
          <SearchError message={error} onRetry={() => retry(category, answers)} />
        )}

        {step === 'results' && result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="text-center">
              <Badge variant="success" className="mb-2">
                <Sparkles className="w-3 h-3 mr-1 inline" />
                {result.recommendations.length} Matches Found
              </Badge>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Your {category} Recommendations
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Ranked by AI based on your profile from official sources
              </p>
            </div>

            <SearchFilters filters={filters} onChange={setFilters} providers={providers} />

            <div className="space-y-4">
              {filteredSchemes.map((scheme, idx) => (
                <RecommendationCard key={scheme.id} scheme={scheme} index={idx} />
              ))}
              {filteredSchemes.length === 0 && (
                <Card hoverable={false} animate={false} className="p-8 text-center">
                  <p className="text-sm text-slate-500 font-sans">No schemes match your current filters.</p>
                </Card>
              )}
            </div>

            <WhyNotEligible ineligible={result.ineligible} />

            {/* Roadmap & Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card hoverable={false} animate={false}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                  Personalized Roadmap
                </h3>
                <RoadmapTimeline steps={result.roadmap} />
              </Card>
              <Card hoverable={false} animate={false}>
                <DocumentChecklist
                  documents={result.documentChecklist}
                  readiness={result.applicationReadiness}
                  missingDocuments={result.missingDocuments}
                />
              </Card>
            </div>

            {/* Next suggestions */}
            {result.nextSuggestions.length > 0 && (
              <Card hoverable={false} animate={false}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-accent-purple" />
                  You may also qualify for...
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.nextSuggestions.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20 font-sans"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

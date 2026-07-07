import React from 'react';
import { motion } from 'framer-motion';
import type { QuestionField } from '../../utils/categoryQuestions';
import type { CategoryAnswers } from '../../types/schemes';
import type { Profile } from '../../types';
import { Input } from '../ui/Input';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { getProfileSummaryForAI } from '../../utils/categoryQuestions';

interface DynamicQuestionsFormProps {
  category: string;
  profile: Profile | null;
  questions: QuestionField[];
  answers: CategoryAnswers;
  onChange: (answers: CategoryAnswers) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const DynamicQuestionsForm: React.FC<DynamicQuestionsFormProps> = ({
  category,
  profile,
  questions,
  answers,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const profileSummary = getProfileSummaryForAI(profile);

  const handleChange = (key: keyof CategoryAnswers, value: string) => {
    onChange({ ...answers, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Badge variant="purple" className="mb-3">
          <Sparkles className="w-3 h-3 mr-1 inline" />
          AI Advisor
        </Badge>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {category} — Quick Questions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans max-w-md mx-auto">
          We already know your profile details. Only a few category-specific questions are needed.
        </p>
      </div>

      {/* Profile memory display */}
      {profile && (
        <Card hoverable={false} animate={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Using your profile (won't ask again)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(profileSummary)
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-sans"
                >
                  {key.replace('_', ' ')}: {String(value)}
                </span>
              ))}
          </div>
        </Card>
      )}

      {questions.length === 0 ? (
        <Card hoverable={false} animate={false} className="p-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mb-4">
            We have everything we need from your profile!
          </p>
          <Button onClick={onSubmit} isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Search Official Sources
          </Button>
        </Card>
      ) : (
        <Card hoverable={false} animate={false} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {questions.map((q, idx) => {
              const key = q.key;
              return (
              <motion.div
                key={String(key)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {q.type === 'select' && q.options ? (
                  <Dropdown
                    label={`${q.label}${q.optional ? ' (Optional)' : ''}`}
                    value={(answers[key] as string) || q.options[0]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    options={q.options}
                  />
                ) : (
                  <Input
                    label={`${q.label}${q.optional ? ' (Optional)' : ''}`}
                    type={q.type === 'number' ? 'number' : 'text'}
                    placeholder={q.placeholder}
                    value={(answers[key] as string) || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    required={!q.optional}
                  />
                )}
              </motion.div>
              );
            })}

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Find My Best Matches
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

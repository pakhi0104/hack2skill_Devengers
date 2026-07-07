import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendationContext } from '../contexts/RecommendationContext';
import { compareSchemesWithAI } from '../services/ai/comparisonEngine';
import { AppLayout } from '../components/layout/AppLayout';
import { CompareTable } from '../components/recommendations/CompareTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Skeleton';
import type { CompareRow } from '../types/schemes';
import { ArrowLeft, GitCompare, Trash2 } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useRecommendationContext();
  const [rows, setRows] = useState<CompareRow[]>([]);
  const [bestSchemeId, setBestSchemeId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareList.length >= 2) {
      setLoading(true);
      compareSchemesWithAI(compareList)
        .then(({ rows: r, bestSchemeId: best }) => {
          setRows(r);
          setBestSchemeId(best);
        })
        .finally(() => setLoading(false));
    }
  }, [compareList]);

  if (compareList.length < 2) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto py-20 text-center px-6">
          <GitCompare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compare Schemes</h2>
          <p className="text-xs text-slate-500 font-sans mt-2">
            Add 2–4 schemes from recommendations to compare side by side.
          </p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>Browse Categories</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter>
      <div className="max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Button size="sm" variant="outline" onClick={clearCompare} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
            Clear All
          </Button>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Scheme Comparison
        </h2>
        <p className="text-xs text-slate-500 font-sans mb-6">
          Comparing {compareList.length} schemes — best match highlighted
        </p>

        {/* Selected schemes pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {compareList.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 border border-brand-500/20 font-sans"
            >
              {s.name}
              <button onClick={() => removeFromCompare(s.id)} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>

        {loading ? (
          <Card hoverable={false} animate={false} className="p-12 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500 font-sans animate-pulse">AI comparing schemes...</p>
          </Card>
        ) : (
          <CompareTable rows={rows} bestSchemeId={bestSchemeId} />
        )}
      </div>
    </AppLayout>
  );
};

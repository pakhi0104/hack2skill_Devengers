import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Skeleton } from '../components/ui/Skeleton';
import { MatchScoreRing } from '../components/recommendations/MatchScoreRing';
import { Bookmark, ArrowRight, ExternalLink, Eye, GitCompare, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useSavedSchemes } from '../hooks';
import { useNavigate } from 'react-router-dom';

// ─── Placeholder category filter pills ───────────────────────────────────────
const CATEGORIES = ['All', 'Scholarships', 'Housing', 'Agriculture', 'Startup', 'Employment', 'Women Welfare', 'Education Loan'];

// ─── Skeleton card shown in loading/placeholder state ────────────────────────
const SchemeCardSkeleton: React.FC = () => (
  <Card hoverable={false} animate={false} className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton variant="circle" className="w-9 h-9 flex-shrink-0" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </Card>
);

export const SavedSchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');
  const { success } = useToast();
  const { savedSchemes, loading, removeScheme } = useSavedSchemes();

  const filteredSchemes = savedSchemes.filter(scheme => {
    const matchesSearch = scheme.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
                         (scheme.summary?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-5xl mx-auto px-6 py-10 w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Saved Schemes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Bookmark any scheme to review details and apply later.
            </p>
          </div>
        </div>

        {/* Search + Category row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search saved schemes…"
            className="flex-1"
            ariaLabel="Search saved schemes"
          />

          {/* Category pill filters */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
            role="tablist"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all font-sans focus:outline-none focus:ring-2 focus:ring-brand-500/40
                  ${activeCategory === cat
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <SchemeCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <Card hoverable className="relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <MatchScoreRing 
                      score={scheme.match_score} 
                      matchLevel={getMatchLevel(scheme.match_score)} 
                      size="md" 
                    />

                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        {scheme.category && (
                          <Badge variant="primary" className="mb-2">{scheme.category}</Badge>
                        )}
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {scheme.scheme_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {scheme.provider} • Saved {formatDate(scheme.saved_at)}
                        </p>
                      </div>

                      {scheme.summary && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                          {scheme.summary}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {scheme.official_url && (
                          <a href={scheme.official_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                              Official Site
                            </Button>
                          </a>
                        )}
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => {
                            if (scheme.scheme_details) {
                              navigate(`/schemes/${scheme.id}`, { state: { scheme: scheme.scheme_details } });
                            }
                          }} 
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await removeScheme(scheme.id);
                            success('Removed', `${scheme.scheme_name} removed from saved schemes.`);
                          }}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <Card hoverable={false} animate={false}>
              <EmptyState
                icon={<Bookmark className="w-8 h-8 text-indigo-400" />}
                title="No Saved Schemes Yet"
                description="Browse government schemes matching your profile and click the save icon to save them here for later review."
                actionText="Explore Schemes"
                onAction={() => window.location.href = '/dashboard'}
              />
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

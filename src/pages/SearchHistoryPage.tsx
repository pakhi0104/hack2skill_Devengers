import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import {
  History,
  Trash2,
  ArrowRight,
  Sparkles,
  Search,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { useSearchHistory } from '../hooks';
import { useNavigate } from 'react-router-dom';

export const SearchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const { history, loading, deleteEntry, clearHistory } = useSearchHistory();

  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
    success('Deleted', 'Search history entry deleted.');
  };

  const handleClearAll = async () => {
    await clearHistory();
    success('Cleared', 'All search history has been deleted.');
  };

  const handleReopenSearch = (category: string, query: string) => {
    navigate(`/search/${encodeURIComponent(category)}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout showFooter={true}>
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Search History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
              View and manage your past AI-powered scheme searches.
            </p>
          </div>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} hoverable={false} animate={false} className="space-y-3">
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </Card>
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hoverable className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary">{entry.category}</Badge>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2 mb-2">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {entry.query}
                        </p>
                      </div>

                      {entry.recommendation_summary && (
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                            {entry.recommendation_summary}
                          </p>
                        </div>
                      )}

                      {entry.results_count !== undefined && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                            {entry.results_count} schemes found
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReopenSearch(entry.category, entry.query)}
                        leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Reopen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEntry(entry.id)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card hoverable={false} animate={false}>
            <EmptyState
              icon={<History className="w-8 h-8 text-slate-400" />}
              title="No Search History"
              description="Your AI-powered searches will be saved here automatically. Start exploring government schemes to build your history."
              actionText="Browse Categories"
              onAction={() => navigate('/dashboard')}
            />
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

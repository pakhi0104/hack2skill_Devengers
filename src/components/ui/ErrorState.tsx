import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We could not load this section. Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="alert"
      aria-live="polite"
      className={`flex flex-col items-center text-center py-10 px-6 rounded-2xl border border-red-200/60 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 shadow-inner">
        <AlertTriangle className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed font-sans">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          aria-label={retryLabel}
        >
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );
};

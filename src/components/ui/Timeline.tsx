import React from 'react';
import { Check } from 'lucide-react';

export interface TimelineStep {
  label: string;
  description?: string;
  /** 'done' | 'active' | 'pending' */
  status: 'done' | 'active' | 'pending';
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const STATUS_STYLES = {
  done: {
    dot: 'bg-accent-emerald border-accent-emerald text-white',
    label: 'text-slate-700 dark:text-slate-300',
    line: 'bg-accent-emerald',
  },
  active: {
    dot: 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/25',
    label: 'text-brand-600 dark:text-brand-400 font-bold',
    line: 'bg-slate-200 dark:bg-slate-800',
  },
  pending: {
    dot: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400',
    label: 'text-slate-400 dark:text-slate-500',
    line: 'bg-slate-200 dark:bg-slate-800',
  },
};

export const Timeline: React.FC<TimelineProps> = ({ steps, className = '' }) => {
  return (
    <ol
      className={`relative ${className}`}
      aria-label="Progress timeline"
    >
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const styles = STATUS_STYLES[step.status];

        return (
          <li key={idx} className="flex gap-3 pb-6 last:pb-0 relative">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                aria-hidden="true"
                className={`absolute left-[13px] top-7 w-0.5 bottom-0 ${styles.line} rounded-full`}
              />
            )}

            {/* Step dot */}
            <div
              className={`
                relative z-10 w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center
                text-[10px] font-bold transition-all ${styles.dot}
              `}
              aria-hidden="true"
            >
              {step.status === 'done' ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : idx + 1}
            </div>

            {/* Step content */}
            <div className="pt-0.5 min-w-0">
              <p className={`text-xs font-semibold leading-snug ${styles.label}`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              )}
              {step.date && (
                <span className="inline-block text-[10px] text-slate-400 font-sans mt-1 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                  {step.date}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

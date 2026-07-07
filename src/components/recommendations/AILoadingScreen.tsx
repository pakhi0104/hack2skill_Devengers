import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Brain, GitCompare, Map, CheckCircle2 } from 'lucide-react';
import type { AILoadingStage } from '../../types/schemes';

interface AILoadingScreenProps {
  stage: AILoadingStage;
  message: string;
  activeSources?: string[];
}

const STAGE_ICONS: Record<AILoadingStage, React.ElementType> = {
  profile: Brain,
  searching: Search,
  analyzing: Sparkles,
  comparing: GitCompare,
  roadmap: Map,
  complete: CheckCircle2,
};

export const AILoadingScreen: React.FC<AILoadingScreenProps> = ({
  stage,
  message,
  activeSources = [],
}) => {
  const Icon = STAGE_ICONS[stage];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-500/20 via-accent-purple/20 to-accent-cyan/20 flex items-center justify-center mb-6 relative"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-500 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/20"
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </motion.div>

      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans"
      >
        {message}
      </motion.p>

      {stage === 'searching' && activeSources.length > 0 && (
        <div className="mt-8 w-full max-w-sm space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Searching Official Sources...
          </p>
          {activeSources.map((source, i) => (
            <motion.div
              key={source}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-brand-500"
              />
              {source}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mt-8">
        {(['profile', 'searching', 'analyzing', 'comparing', 'roadmap'] as AILoadingStage[]).map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s === stage ? 'bg-brand-500 scale-125' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

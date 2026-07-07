import React from 'react';
import { motion } from 'framer-motion';

interface MatchScoreRingProps {
  score: number;
  matchLevel: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 56, md: 72, lg: 96 };
const STROKES = { sm: 4, md: 5, lg: 6 };

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({ score, matchLevel, size = 'md' }) => {
  const dim = SIZES[size];
  const stroke = STROKES[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#6d83f0' : '#f59e0b';

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Match score ${score} percent, ${matchLevel}`}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-200 dark:text-slate-800"
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-extrabold text-slate-900 dark:text-white leading-none"
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <span
        className={`text-[9px] font-bold uppercase tracking-wider font-sans ${
          score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-brand-500' : 'text-amber-500'
        }`}
      >
        {matchLevel}
      </span>
    </div>
  );
};

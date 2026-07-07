import React from 'react';
import { motion } from 'framer-motion';
import type { RoadmapStep } from '../../types/schemes';
import { CheckCircle2 } from 'lucide-react';

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ steps }) => {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-500 via-accent-purple to-accent-cyan rounded-full" />

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex gap-4"
          >
            <div className="absolute -left-6 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-brand-500/20 z-10">
              {step.step}
            </div>
            <div className="flex-1 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                {step.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                {step.description}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className="absolute -left-[17px] bottom-0 text-slate-300 dark:text-slate-700 text-lg leading-none select-none">
                ↓
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

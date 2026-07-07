import React from 'react';
import type { IneligibleScheme } from '../../types/schemes';
import { Card } from '../ui/Card';
import { XCircle, Lightbulb } from 'lucide-react';

interface WhyNotEligibleProps {
  ineligible: IneligibleScheme[];
}

export const WhyNotEligible: React.FC<WhyNotEligibleProps> = ({ ineligible }) => {
  if (ineligible.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-500" />
        Why You Are Not Eligible
      </h3>
      {ineligible.map((item, idx) => (
        <Card key={idx} hoverable={false} animate={false} className="border-red-200/40 dark:border-red-900/30">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
          <p className="text-[10px] text-slate-400 font-sans">{item.provider}</p>
          <ul className="mt-2 space-y-1">
            {item.whyNotEligible.map((reason, i) => (
              <li key={i} className="text-[11px] text-red-600 dark:text-red-400 font-sans flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {reason}
              </li>
            ))}
          </ul>
          {item.alternatives && item.alternatives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Recommended Alternatives
              </span>
              <ul className="mt-1 space-y-0.5">
                {item.alternatives.map((alt, i) => (
                  <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                    • {alt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

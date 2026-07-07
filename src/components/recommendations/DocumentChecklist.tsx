import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface DocumentItem {
  name: string;
  id: string;
  completed: boolean;
}

interface DocumentChecklistProps {
  documents: string[] | DocumentItem[];
  readiness: number;
  missingDocuments: string[];
  onToggle?: (id: string, completed: boolean) => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  readiness,
  missingDocuments,
  onToggle,
}) => {
  const isDocumentItem = (doc: string | DocumentItem): doc is DocumentItem => {
    return typeof doc === 'object' && doc !== null && 'id' in doc;
  };

  const handleToggle = (doc: string | DocumentItem) => {
    if (onToggle && isDocumentItem(doc)) {
      onToggle(doc.id, !doc.completed);
    }
  };

  const getDocName = (doc: string | DocumentItem): string => {
    return isDocumentItem(doc) ? doc.name : doc;
  };

  const isDocCompleted = (doc: string | DocumentItem): boolean => {
    return isDocumentItem(doc) ? doc.completed : false;
  };

  const isReady = readiness >= 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Application Readiness</h4>
        {isReady ? (
          <Badge variant="success">Ready to Apply</Badge>
        ) : (
          <span className="text-xs font-bold text-brand-500">{readiness}%</span>
        )}
      </div>

      <ProgressBar value={readiness} color={isReady ? 'success' : 'brand'} showLabel />

      {missingDocuments.length > 0 && !isReady && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">
          Missing: {missingDocuments.join(', ')}
        </p>
      )}

      <ul className="space-y-2">
        {documents.map((doc) => {
          const name = getDocName(doc);
          const completed = isDocCompleted(doc);
          const id = isDocumentItem(doc) ? doc.id : name;
          
          return (
            <motion.li
              key={id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleToggle(doc)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all font-sans text-xs font-semibold
                ${completed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white/30 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-brand-500/30'
                }`}
              role="checkbox"
              aria-checked={completed}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleToggle(doc)}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}
              >
                {completed && <Check className="w-3 h-3 text-white" />}
              </div>
              {name}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

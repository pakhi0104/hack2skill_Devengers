import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <Inbox className="w-8 h-8 text-slate-400" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/20 dark:bg-slate-900/10 backdrop-blur-sm">
      {/* Icon Frame */}
      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-inner mb-4">
        {icon}
      </div>
      
      {/* Text details */}
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-sans leading-relaxed">
        {description}
      </p>

      {/* Optional action triggers */}
      {actionText && onAction && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  locked?: boolean;
  onLockedClick?: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  title = 'Navigation',
  className = '',
}) => {
  const location = useLocation();

  return (
    <aside
      className={`p-1 rounded-2xl bg-white/30 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 backdrop-blur-md ${className}`}
      aria-label={title}
    >
      {title && (
        <p className="px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">
          {title}
        </p>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = !item.locked && location.pathname === item.path;
          const baseClass = `relative flex items-center justify-between px-4 py-2.5 text-xs font-semibold rounded-xl transition-all font-sans w-full text-left
            ${active
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
            }`;

          const content = (
            <>
              {active && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute inset-0 bg-brand-50 dark:bg-brand-950/20 rounded-xl border border-brand-100/30 dark:border-brand-900/10 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" aria-hidden="true" />
                {item.name}
              </span>
            </>
          );

          if (item.locked) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={item.onLockedClick}
                className={baseClass}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.path + item.name} to={item.path} className={baseClass}>
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 shadow-sm backdrop-blur-sm transition-all focus:outline-none"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-away backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-36 rounded-xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 shadow-lg backdrop-blur-md p-1.5 z-20 flex flex-col gap-0.5"
            >
              {[
                { name: 'light', label: 'Light', icon: Sun },
                { name: 'dark', label: 'Dark', icon: Moon },
                { name: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = theme === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setTheme(item.name as any);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors font-sans
                      ${isActive 
                        ? 'bg-brand-500 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

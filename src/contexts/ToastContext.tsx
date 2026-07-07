import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContextType {
  toast: (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    description?: string
  ) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, title, description }]);
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => toast('success', title, description), [toast]);
  const error = useCallback((title: string, description?: string) => toast('error', title, description), [toast]);
  const info = useCallback((title: string, description?: string) => toast('info', title, description), [toast]);
  const warning = useCallback((title: string, description?: string) => toast('warning', title, description), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      
      {/* Toast Render Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((msg) => {
            const isSuccess = msg.type === 'success';
            const isError = msg.type === 'error';
            const isWarning = msg.type === 'warning';
            
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                className="pointer-events-auto w-full glassmorphism p-4 rounded-2xl flex items-start gap-3 shadow-lg border border-white/20 dark:border-white/10"
              >
                {/* Icon Wrapper */}
                <div className="mt-0.5 flex-shrink-0">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-accent-emerald" />}
                  {isError && <XCircle className="w-5 h-5 text-red-500" />}
                  {isWarning && <AlertCircle className="w-5 h-5 text-amber-500" />}
                  {msg.type === 'info' && <Info className="w-5 h-5 text-brand-500" />}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                    {msg.title}
                  </h4>
                  {msg.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                      {msg.description}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(msg.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg p-0.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

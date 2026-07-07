import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full py-2.5 px-4 rounded-xl border font-sans text-sm focus:outline-none transition-all duration-200
              ${leftIcon ? 'pl-11' : ''} 
              ${rightIcon ? 'pr-11' : ''}
              ${
                error
                  ? 'border-red-400 dark:border-red-500/30 bg-red-50/10 dark:bg-red-950/10 text-red-900 dark:text-red-200 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 shadow-sm backdrop-blur-sm'
              } 
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium select-none animate-fade-in mt-0.5">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal select-none">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

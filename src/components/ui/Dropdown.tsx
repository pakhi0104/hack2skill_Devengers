import React, { forwardRef } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (DropdownOption | string)[];
  error?: string;
  helperText?: string;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase select-none">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full py-2.5 px-4 rounded-xl border font-sans text-sm focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right
              ${
                error
                  ? 'border-red-400 dark:border-red-500/30 bg-red-50/10 dark:bg-red-950/10 text-red-900 dark:text-red-200 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 shadow-sm backdrop-blur-sm'
              } 
              ${className}`}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
            {...props}
          >
            {options.map((option, idx) => {
              const val = typeof option === 'string' ? option : option.value;
              const labelText = typeof option === 'string' ? option : option.label;
              return (
                <option key={idx} value={val} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
                  {labelText}
                </option>
              );
            })}
          </select>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium select-none mt-0.5">
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

Dropdown.displayName = 'Dropdown';

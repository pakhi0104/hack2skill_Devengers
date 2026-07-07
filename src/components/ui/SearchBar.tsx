import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show clear (×) button when there is a value */
  clearable?: boolean;
  /** Compact height variant */
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const SIZE_CLASSES = {
  sm: 'py-1.5 text-xs',
  md: 'py-2.5 text-sm',
  lg: 'py-3.5 text-base',
};

const ICON_SIZE = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const PADDING_LEFT = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12',
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search schemes, benefits, subsidies…',
  disabled = false,
  className = '',
  clearable = true,
  size = 'md',
  ariaLabel = 'Search',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(value);
    }
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon */}
      <span
        className={`absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center ${ICON_SIZE[size]}`}
        aria-hidden="true"
      >
        <Search className={ICON_SIZE[size]} />
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        className={`
          w-full ${PADDING_LEFT[size]} ${clearable && value ? 'pr-9' : 'pr-4'}
          ${SIZE_CLASSES[size]}
          rounded-xl border font-sans
          bg-white/50 dark:bg-slate-900/50
          text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-500
          border-slate-200 dark:border-slate-800
          focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
          backdrop-blur-sm shadow-sm
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />

      {/* Clear button */}
      {clearable && value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md p-0.5"
        >
          <X className={ICON_SIZE[size]} />
        </button>
      )}
    </div>
  );
};

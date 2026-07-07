import React from 'react';
import type { SearchFilters as Filters } from '../../types/schemes';
import { Dropdown } from '../ui/Dropdown';
import { SlidersHorizontal } from 'lucide-react';

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  providers: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, providers }) => {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="glassmorphism rounded-2xl p-4 border border-white/20 dark:border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filters</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Dropdown
          label="Provider"
          value={filters.provider}
          onChange={(e) => update('provider', e.target.value)}
          options={['All', ...providers]}
        />
        <Dropdown
          label="Match Score"
          value={filters.matchScore}
          onChange={(e) => update('matchScore', e.target.value)}
          options={['All', '80', '60', '40']}
        />
        <Dropdown
          label="Deadline"
          value={filters.deadline}
          onChange={(e) => update('deadline', e.target.value)}
          options={['All', 'Rolling', 'Upcoming']}
        />
        <Dropdown
          label="Category"
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          options={['All', 'Scholarships', 'Education Loans', 'Housing', 'Startup', 'Agriculture', 'Employment']}
        />
      </div>
    </div>
  );
};

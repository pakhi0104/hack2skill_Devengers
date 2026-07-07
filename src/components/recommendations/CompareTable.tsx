import React from 'react';
import type { CompareRow } from '../../types/schemes';
import { Badge } from '../ui/Badge';
import { Trophy } from 'lucide-react';

interface CompareTableProps {
  rows: CompareRow[];
  bestSchemeId: string;
}

const COLUMNS: { key: keyof CompareRow; label: string }[] = [
  { key: 'name', label: 'Scheme Name' },
  { key: 'provider', label: 'Provider' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'documents', label: 'Documents' },
  { key: 'interestRate', label: 'Interest Rate' },
  { key: 'processingTime', label: 'Processing Time' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'matchScore', label: 'Match Score' },
  { key: 'recommendation', label: 'Recommendation' },
];

export const CompareTable: React.FC<CompareTableProps> = ({ rows, bestSchemeId }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
      <table className="w-full text-left text-xs font-sans">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-900/50">
            <th className="p-3 font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/80 dark:bg-slate-900/50">
              Field
            </th>
            {rows.map((row) => (
              <th
                key={row.schemeId}
                className={`p-3 font-bold min-w-[160px] ${
                  row.schemeId === bestSchemeId
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {row.schemeId === bestSchemeId && <Trophy className="w-3.5 h-3.5" />}
                  {row.name}
                  {row.schemeId === bestSchemeId && (
                    <Badge variant="success" className="ml-1">Best</Badge>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COLUMNS.filter((c) => c.key !== 'name').map((col) => (
            <tr key={col.key} className="border-t border-slate-100 dark:border-slate-800/40">
              <td className="p-3 font-bold text-slate-500 sticky left-0 bg-white/80 dark:bg-slate-950/80">
                {col.label}
              </td>
              {rows.map((row) => (
                <td
                  key={row.schemeId}
                  className={`p-3 text-slate-600 dark:text-slate-400 leading-relaxed ${
                    row.schemeId === bestSchemeId ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  {col.key === 'matchScore' ? (
                    <span className="font-bold text-brand-500">{row.matchScore}%</span>
                  ) : col.key === 'officialWebsite' && row.officialWebsite ? (
                    <a
                      href={row.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline break-all"
                    >
                      Visit
                    </a>
                  ) : (
                    String(row[col.key] || '—')
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

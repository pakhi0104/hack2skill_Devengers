import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SchemeRecommendation, RecommendationResult } from '../types/schemes';

interface RecommendationContextType {
  compareList: SchemeRecommendation[];
  addToCompare: (scheme: SchemeRecommendation) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  lastResult: RecommendationResult | null;
  setLastResult: (result: RecommendationResult | null) => void;
  selectedScheme: SchemeRecommendation | null;
  setSelectedScheme: (scheme: SchemeRecommendation | null) => void;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

const MAX_COMPARE = 4;

export const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<SchemeRecommendation[]>([]);
  const [lastResult, setLastResult] = useState<RecommendationResult | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecommendation | null>(null);

  const addToCompare = useCallback((scheme: SchemeRecommendation) => {
    setCompareList((prev) => {
      if (prev.some((s) => s.id === scheme.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, scheme];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  const isInCompare = useCallback(
    (id: string) => compareList.some((s) => s.id === id),
    [compareList]
  );

  return (
    <RecommendationContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        lastResult,
        setLastResult,
        selectedScheme,
        setSelectedScheme,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendationContext = () => {
  const ctx = useContext(RecommendationContext);
  if (!ctx) throw new Error('useRecommendationContext must be used within RecommendationProvider');
  return ctx;
};

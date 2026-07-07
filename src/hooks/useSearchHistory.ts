import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchSearchHistory, deleteSearchHistoryEntry, clearAllSearchHistory } from '../services/searchHistoryService';
import type { SearchHistoryItem } from '../types';

export function useSearchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const entries = await fetchSearchHistory(user.id);
    setHistory(entries);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteEntry = useCallback(async (id: string) => {
    await deleteSearchHistoryEntry(id);
    await refresh();
  }, [refresh]);

  const clearHistory = useCallback(async () => {
    if (!user?.id) return;
    await clearAllSearchHistory(user.id);
    await refresh();
  }, [user?.id, refresh]);

  return { history, loading, refresh, deleteEntry, clearHistory };
}

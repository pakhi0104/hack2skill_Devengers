import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { savedSchemesService } from '../services';
import type { SavedScheme } from '../types';

export function useSavedSchemes() {
  const { user } = useAuth();
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedSchemes = useCallback(async () => {
    if (!user?.id) {
      setSavedSchemes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const schemes = await savedSchemesService.getSavedSchemes(user.id);
    setSavedSchemes(schemes);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchSavedSchemes();
  }, [fetchSavedSchemes]);

  const isSchemeSaved = useCallback(async (schemeName: string) => {
    if (!user?.id) return false;
    return savedSchemesService.isSchemeSaved(user.id, schemeName);
  }, [user?.id]);

  const saveScheme = useCallback(async (scheme: Omit<SavedScheme, 'id' | 'saved_at'>) => {
    if (!user?.id) return null;
    const saved = await savedSchemesService.saveScheme(scheme);
    if (saved) {
      await fetchSavedSchemes();
    }
    return saved;
  }, [user?.id, fetchSavedSchemes]);

  const removeScheme = useCallback(async (id: string) => {
    if (!user?.id) return false;
    const success = await savedSchemesService.removeScheme(id, user.id);
    if (success) {
      await fetchSavedSchemes();
    }
    return success;
  }, [user?.id, fetchSavedSchemes]);

  const clearSavedSchemes = useCallback(async () => {
    if (!user?.id) return false;
    const success = await savedSchemesService.deleteAllSavedSchemes(user.id);
    if (success) {
      await fetchSavedSchemes();
    }
    return success;
  }, [user?.id, fetchSavedSchemes]);

  return {
    savedSchemes,
    loading,
    fetchSavedSchemes,
    isSchemeSaved,
    saveScheme,
    removeScheme,
    clearSavedSchemes,
  };
}

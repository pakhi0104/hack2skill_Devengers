import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { SearchHistoryItem } from '../types';

const MOCK_HISTORY_KEY = 'schemematch_search_history';

export async function saveSearchHistory(
  userId: string,
  category: string,
  query: string,
  extraAnswers?: Record<string, any>,
  resultsCount?: number,
  recommendationSummary?: string
): Promise<{ error: string | null }> {
  const entry = {
    user_id: userId,
    category,
    query,
    extra_answers: extraAnswers || {},
    results_count: resultsCount ?? 0,
    recommendation_summary: recommendationSummary,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('search_history').insert([entry]);
    if (error) return { error: error.message };
    return { error: null };
  }

  // Mock mode
  const stored = localStorage.getItem(MOCK_HISTORY_KEY);
  const history: SearchHistoryItem[] = stored ? JSON.parse(stored) : [];
  history.unshift({
    id: crypto.randomUUID(),
    ...entry,
  });
  localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  return { error: null };
}

export async function fetchSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search history fetch error:', error.message);
      return [];
    }
    return (data as SearchHistoryItem[]) || [];
  }

  const stored = localStorage.getItem(MOCK_HISTORY_KEY);
  if (!stored) return [];
  const history: SearchHistoryItem[] = JSON.parse(stored);
  return history.filter((h) => h.user_id === userId);
}

export async function deleteSearchHistoryEntry(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('search_history').delete().eq('id', id);
    return { error: error?.message || null };
  }

  const stored = localStorage.getItem(MOCK_HISTORY_KEY);
  if (!stored) return { error: null };
  const history: SearchHistoryItem[] = JSON.parse(stored);
  localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.filter((h) => h.id !== id)));
  return { error: null };
}

export async function clearAllSearchHistory(userId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('search_history').delete().eq('user_id', userId);
    return { error: error?.message || null };
  }

  const stored = localStorage.getItem(MOCK_HISTORY_KEY);
  if (!stored) return { error: null };
  const history: SearchHistoryItem[] = JSON.parse(stored);
  localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.filter((h) => h.user_id !== userId)));
  return { error: null };
}

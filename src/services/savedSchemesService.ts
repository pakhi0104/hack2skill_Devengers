import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { SavedScheme } from '../types';

// Local storage keys for mock mode
const MOCK_SAVED_SCHEMES_KEY = 'schemematch_mock_saved_schemes';

export const savedSchemesService = {
  /**
   * Get all saved schemes for the current user
   */
  async getSavedSchemes(userId: string): Promise<SavedScheme[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('saved_schemes')
        .select('*')
        .order('saved_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching saved schemes:', error);
        return [];
      }
      return data || [];
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_SAVED_SCHEMES_KEY);
      if (mockData) {
        const allSchemes: SavedScheme[] = JSON.parse(mockData);
        return allSchemes.filter(s => s.user_id === userId)
                         .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
      }
      return [];
    }
  },

  /**
   * Check if a scheme is already saved
   */
  async isSchemeSaved(userId: string, schemeName: string): Promise<boolean> {
    const savedSchemes = await this.getSavedSchemes(userId);
    return savedSchemes.some(s => s.scheme_name === schemeName);
  },

  /**
   * Save a new scheme
   */
  async saveScheme(scheme: Omit<SavedScheme, 'id' | 'saved_at'>): Promise<SavedScheme | null> {
    const newScheme: SavedScheme = {
      ...scheme,
      id: crypto.randomUUID(),
      saved_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('saved_schemes')
        .insert([newScheme])
        .select()
        .single();
      
      if (error) {
        console.error('Error saving scheme:', error);
        return null;
      }
      return data;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_SAVED_SCHEMES_KEY);
      const allSchemes: SavedScheme[] = mockData ? JSON.parse(mockData) : [];
      // Check for duplicates
      if (allSchemes.some(s => s.user_id === scheme.user_id && s.scheme_name === scheme.scheme_name)) {
        return null;
      }
      allSchemes.push(newScheme);
      localStorage.setItem(MOCK_SAVED_SCHEMES_KEY, JSON.stringify(allSchemes));
      return newScheme;
    }
  },

  /**
   * Remove a saved scheme
   */
  async removeScheme(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('saved_schemes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error removing scheme:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_SAVED_SCHEMES_KEY);
      if (mockData) {
        const allSchemes: SavedScheme[] = JSON.parse(mockData);
        const filteredSchemes = allSchemes.filter(s => s.id !== id);
        localStorage.setItem(MOCK_SAVED_SCHEMES_KEY, JSON.stringify(filteredSchemes));
      }
      return true;
    }
  },

  /**
   * Delete all saved schemes for a user
   */
  async deleteAllSavedSchemes(userId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('saved_schemes')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting all saved schemes:', error);
        return false;
      }
      return true;
    } else {
      // Mock mode
      const mockData = localStorage.getItem(MOCK_SAVED_SCHEMES_KEY);
      if (mockData) {
        const allSchemes: SavedScheme[] = JSON.parse(mockData);
        const filteredSchemes = allSchemes.filter(s => s.user_id !== userId);
        localStorage.setItem(MOCK_SAVED_SCHEMES_KEY, JSON.stringify(filteredSchemes));
      }
      return true;
    }
  }
};

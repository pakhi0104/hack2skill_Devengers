import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to determine if Supabase is properly configured with custom credentials
export const isSupabaseConfigured = (() => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  
  // Check if they are default template placeholders
  const isPlaceholderUrl = supabaseUrl.includes('your-project.supabase.co') || supabaseUrl.includes('placeholder.supabase.co');
  const isPlaceholderKey = supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder-anon-key');
  
  return !isPlaceholderUrl && !isPlaceholderKey;
})();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'SchemeMatch AI: Supabase environment variables are missing or configured with placeholder values. ' +
    'The application will run in local mock database mode. To connect to a live database, ' +
    'configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file.'
  );
}

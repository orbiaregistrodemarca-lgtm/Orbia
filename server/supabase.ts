import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim().replace(/[\r\n]/g, '');

  console.log('Initializing Supabase...');
  console.log('URL length:', supabaseUrl.length);
  console.log('Key length:', supabaseAnonKey.length);

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  // Ensure URL starts with https://
  const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

  supabaseInstance = createClient(normalizedUrl, supabaseAnonKey);
  return supabaseInstance;
}

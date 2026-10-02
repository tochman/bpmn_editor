import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  const safeUrl = url || 'https://placeholder.supabase.co';
  const safeAnonKey = anonKey || 'placeholder-anon-key';

  return createBrowserClient(safeUrl, safeAnonKey);
}

const PLACEHOLDER_VALUES = new Set([
  'https://placeholder.supabase.co',
  'placeholder-anon-key',
  'your_supabase_project_url',
  'your_supabase_anon_key',
]);

export function getSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const url = rawUrl.trim();
  const anonKey = rawAnonKey.trim();

  const isConfigured = Boolean(
    url &&
      anonKey &&
      !PLACEHOLDER_VALUES.has(url) &&
      !PLACEHOLDER_VALUES.has(anonKey) &&
      !url.includes('your_supabase') &&
      !anonKey.includes('your_supabase')
  );

  return { url, anonKey, isConfigured };
}

export function assertSupabaseConfigured() {
  const { isConfigured, url, anonKey } = getSupabaseConfig();

  if (!isConfigured) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment or Netlify dashboard.'
    );
  }

  return { url, anonKey };
}

import { createClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function POST() {
  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

export async function GET() {
  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    redirect('/login');
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

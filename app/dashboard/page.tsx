import { createClient } from '@/lib/supabase/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { redirect } from 'next/navigation';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    redirect('/login');
  }

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const { data: diagrams } = await supabase
    .from('bpmn_diagrams')
    .select('id, name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const { data: profile } = await supabase
    .from('bpmn_profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  return (
    <DashboardContent 
      diagrams={diagrams} 
      firstName={profile?.first_name} 
    />
  );
}

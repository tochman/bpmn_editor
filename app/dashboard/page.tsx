import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface DiagramSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export default async function DashboardPage() {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8" cy="8" r="2" />
                  <circle cx="16" cy="16" r="2" />
                  <path d="M10 8h4M8 10v4M16 10v4" />
                </svg>
                <span className="text-xl font-bold text-gray-900">BPMN Editor</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <span className="text-sm text-gray-600">
                  Welcome, {profile.first_name}
                </span>
              )}
              <form action="/api/auth/signout" method="post">
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Diagrams</h1>
          <Link 
            href="/editor/new" 
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Diagram
          </Link>
        </div>

        {diagrams && diagrams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diagrams.map((diagram: DiagramSummary) => (
              <Link
                key={diagram.id}
                href={`/editor/${diagram.id}`}
                className="bg-white p-6 rounded-sm shadow-sm hover:shadow-md border border-gray-200 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8" cy="8" r="2" />
                    <circle cx="16" cy="16" r="2" />
                    <path d="M10 8h4M8 10v4M16 10v4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{diagram.name}</h3>
                <p className="text-sm text-gray-500">
                  Last edited: {new Date(diagram.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diagrams yet</h3>
            <p className="text-gray-500 mb-6">Create your first BPMN diagram to get started</p>
            <Link 
              href="/editor/new" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first diagram
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

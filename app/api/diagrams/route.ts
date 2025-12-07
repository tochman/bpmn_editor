import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/diagrams - List all diagrams for the current user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: diagrams, error } = await supabase
    .from('bpmn_diagrams')
    .select('id, name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(diagrams);
}

// POST /api/diagrams - Create a new diagram
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, xml_content } = body;

  if (!xml_content) {
    return NextResponse.json({ error: 'xml_content is required' }, { status: 400 });
  }

  const { data: diagram, error } = await supabase
    .from('bpmn_diagrams')
    .insert({
      user_id: user.id,
      name: name || 'Untitled Diagram',
      xml_content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(diagram, { status: 201 });
}

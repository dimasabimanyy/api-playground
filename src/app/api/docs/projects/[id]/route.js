import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/docs/projects/[id] - Get specific docs project
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    const { data: project, error } = await supabase
      .from('docs_projects')
      .select(`
        *,
        collections:collection_id (
          id,
          name,
          description,
          requests (*)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Docs project not found' }, { status: 404 });
      }
      console.error('Error fetching docs project:', error);
      return NextResponse.json({ error: 'Failed to fetch docs project' }, { status: 500 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Error in docs project API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/docs/projects/[id] - Update docs project
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, settings, status } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings !== undefined) updateData.settings = settings;
    if (status !== undefined) updateData.status = status;
    
    updateData.updated_at = new Date().toISOString();

    const { data: project, error } = await supabase
      .from('docs_projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Docs project not found' }, { status: 404 });
      }
      console.error('Error updating docs project:', error);
      return NextResponse.json({ error: 'Failed to update docs project' }, { status: 500 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Error in docs project API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/docs/projects/[id] - Delete docs project
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    const { error } = await supabase
      .from('docs_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting docs project:', error);
      return NextResponse.json({ error: 'Failed to delete docs project' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Docs project deleted successfully' });

  } catch (error) {
    console.error('Error in docs project API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
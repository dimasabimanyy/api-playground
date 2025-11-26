import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/public/[username]/[slug] - Get public documentation project by username and slug
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { username, slug } = params;

    console.log('Looking for project:', { username, slug });

    // Get project by slug and verify it's public
    // Note: For now we'll match by slug only since we don't have user lookup implemented
    // In production, you'd want to join with users table or implement proper username lookup
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
      .eq('slug', slug)
      .eq('status', 'published') // Only published projects
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No project found with slug: ${slug} and status: published`);
        return NextResponse.json({ error: 'Documentation not found' }, { status: 404 });
      }
      console.error('Error fetching public project:', error);
      return NextResponse.json({ error: 'Failed to fetch documentation' }, { status: 500 });
    }

    // Check if project is public (you might want to add this field)
    // if (!project.settings?.documentationOptions?.isPublic) {
    //   return NextResponse.json({ error: 'Documentation is private' }, { status: 403 });
    // }

    return NextResponse.json({ 
      project,
      username: username // Return username for display
    });

  } catch (error) {
    console.error('Error in public documentation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
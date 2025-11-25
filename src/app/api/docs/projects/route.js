import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Helper function to generate URL-friendly slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(supabase, baseSlug, userId, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    let query = supabase
      .from('docs_projects')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', userId);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data: existing } = await query;
    
    if (!existing || existing.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET /api/docs/projects - Get all docs projects for user
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('docs_projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching docs projects count:', countError);
      return NextResponse.json({ error: 'Failed to fetch docs projects count' }, { status: 500 });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    const { data: projects, error } = await supabase
      .from('docs_projects')
      .select(`
        *,
        collection:collections!collection_id (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching docs projects:', error);
      return NextResponse.json({ error: 'Failed to fetch docs projects' }, { status: 500 });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({ 
      projects: projects || [],
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });

  } catch (error) {
    console.error('Error in docs projects API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/docs/projects - Create new docs project
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, collection_id, settings, status = 'published', slug: providedSlug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!collection_id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Generate slug from name or use provided slug
    const baseSlug = providedSlug ? generateSlug(providedSlug) : generateSlug(name);
    
    // Ensure slug is unique for this user
    const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug, user.id);

    const projectData = {
      name,
      description: description || '',
      collection_id,
      settings: settings || {},
      status,
      slug: uniqueSlug,
      user_id: user.id,
    };

    const { data: project, error } = await supabase
      .from('docs_projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating docs project:', error);
      return NextResponse.json({ error: 'Failed to create docs project' }, { status: 500 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Error in docs projects API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
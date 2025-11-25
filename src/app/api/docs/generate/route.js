import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateDocumentationFromCollection } from '@/lib/docs-helper';

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
async function ensureUniqueSlug(supabase, baseSlug, userId) {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data: existing } = await supabase
      .from('docs_projects')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', userId);
    
    if (!existing || existing.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { selectedCollection, customization, selectedTemplate } = body;

    if (!selectedCollection) {
      return NextResponse.json(
        { error: 'Collection is required' },
        { status: 400 }
      );
    }

    // Get the authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Prepare the documentation settings
    const projectName = customization.title || `${selectedCollection.name} Documentation`;
    const baseSlug = generateSlug(projectName);
    const uniqueSlug = await ensureUniqueSlug(supabase, baseSlug, user.id);
    
    const docsSettings = {
      name: projectName,
      // description: customization.description || `Documentation for ${selectedCollection.name}`,
      slug: uniqueSlug,
      user_id: user.id,
      status: 'published',
      collection_id: selectedCollection.id,
      settings: {
        ...customization,
        template: selectedTemplate,
      },
    };

    // Insert into docs_projects table
    const { data: insertedProject, error: insertError } = await supabase
      .from('docs_projects')
      .insert([docsSettings])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting docs project:', insertError);
      return NextResponse.json(
        { error: 'Failed to create documentation project' },
        { status: 500 }
      );
    }

    // Generate the actual documentation
    const documentationResult = await generateDocumentationFromCollection(
      selectedCollection,
      docsSettings
    );

    console.log('Documentation generated successfully:', insertedProject.id);

    return NextResponse.json({
      success: true,
      project: insertedProject,
      documentationResult,
    });

  } catch (error) {
    console.error('Error generating documentation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
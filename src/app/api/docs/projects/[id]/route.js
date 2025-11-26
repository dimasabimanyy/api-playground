import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Helper function to generate URL-friendly slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(supabase, baseSlug, userId, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = supabase
      .from("docs_projects")
      .select("id")
      .eq("slug", slug)
      .eq("user_id", userId);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data: existing } = await query;

    if (!existing || existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET /api/docs/projects/[id] - Get specific docs project
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log("id : ", id);

    const { data: project, error } = await supabase
      .from("docs_projects")
      .select(
        `
        *,
        collections:collection_id (
          id,
          name,
          description,
          requests (*)
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    console.log("project res: ", project);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Docs project not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching docs project:", error);
      return NextResponse.json(
        { error: "Failed to fetch docs project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error in docs project API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/docs/projects/[id] - Update docs project
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, settings, status, slug: providedSlug } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings !== undefined) updateData.settings = settings;
    if (status !== undefined) updateData.status = status;

    // Handle slug update - regenerate from name or use provided slug
    if (name !== undefined || providedSlug !== undefined) {
      const baseSlug = providedSlug
        ? generateSlug(providedSlug)
        : name
        ? generateSlug(name)
        : null;
      if (baseSlug) {
        const uniqueSlug = await ensureUniqueSlug(
          supabase,
          baseSlug,
          user.id,
          id
        );
        updateData.slug = uniqueSlug;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data: project, error } = await supabase
      .from("docs_projects")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Docs project not found" },
          { status: 404 }
        );
      }
      console.error("Error updating docs project:", error);
      return NextResponse.json(
        { error: "Failed to update docs project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error in docs project API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/docs/projects/[id] - Delete docs project
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    const { error } = await supabase
      .from("docs_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting docs project:", error);
      return NextResponse.json(
        { error: "Failed to delete docs project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Docs project deleted successfully" });
  } catch (error) {
    console.error("Error in docs project API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { selectedCollection, customization, selectedTemplate } = body;

    if (!selectedCollection) {
      return NextResponse.json(
        { error: "Collection is required" },
        { status: 400 }
      );
    }

    // Get the authenticated user from Supabase
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

    // Prepare the documentation settings
    const docsSettings = {
      name: customization.title || `${selectedCollection.name} Documentation`,
      // description:
      //   customization.description ||
      //   `Documentation for ${selectedCollection.name}`,
      user_id: user.id,
      status: "published",
      collection_id: selectedCollection.id,
      settings: {
        ...customization,
        template: selectedTemplate,
      },
    };

    // Insert into docs_projects table
    const { data: insertedProject, error: insertError } = await supabase
      .from("docs_projects")
      .insert([docsSettings])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting docs project:", insertError);

      return NextResponse.json(
        { error: "Failed to create documentation project" },
        { status: 500 }
      );
    }

    // Generate the actual documentation
    // const documentationResult = await generateDocumentationFromCollection(
    //   selectedCollection,
    //   docsSettings
    // );

    console.log("Documentation generated successfully:", insertedProject.id);

    return NextResponse.json({
      success: true,
      result: insertedProject,
    });
  } catch (error) {
    console.error("Error generating documentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

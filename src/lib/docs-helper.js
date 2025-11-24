import { createClient } from "./supabase";

export const generateDocumentationFromCollection = async (collection = {}, settings) => {
  try {
    const supabase = createClient();

    if (!collection) {
      console.error("Collection props is required!");
    }
    
    const docsProject = {
      name: `${collection.name || "API"} Documentation`,
      description:
        customization.description ||
        `Documentation for ${collection.name || "API Collection"}`,
      settings,
      status: "PUBLISHED",
      collection_id: collection.id,
    };

    const { data: insertedProject, error } = await supabase
      .from("docs_projects")
      .insert([docsProject])
      .select()
      .single();

    if (error) {
      console.error("Error inserting docs project:", error);
      throw error;
    }

    console.log("Docs project created:", insertedProject);

    return insertedProject;
  } catch (error) {
    console.error(error);

    throw new Error(error.message);
  }
};

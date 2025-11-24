import { createClient } from "./supabase";

export const generateDocumentationFromCollection = async (
  collection = {},
  settings = {}
) => {
  try {
    const supabase = createClient();

    if (!collection) {
      console.error("Collection props is required!");
    }

    const docsProject = {
      name: settings.name || `${collection.name || "API"} Documentation`,
      // description:
      //   settings.description ||
      //   `Documentation for ${collection.name || "API Collection"}`, // Do we need this? the field hasn't exist yet btw
      settings: settings.settings,
      status: settings.status,
      collection_id: collection.id,
      user_id: settings.userId
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

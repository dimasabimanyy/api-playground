import { createClient } from "./supabase";

export const generateDocumentationFromCollection = async (collection, settings) => {
  try {
    // Insert to database
    // Insert into docs_projects table
    const supabase = createClient();

    // Get the selected collection to use its name
    const selectedCollection = filteredCollections.find(
      (c) => c.id === selectedCollectionId
    );

    const docsProject = {
      name: `${selectedCollection?.name || "API"} Documentation`,
      description:
        customization.description ||
        `Documentation for ${selectedCollection?.name || "API Collection"}`,
      settings,
      status: "",
      collection_id: selectedCollectionId,
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
  } catch (error) {
    console.error(error);

    throw new Error(error.message);
  }
};

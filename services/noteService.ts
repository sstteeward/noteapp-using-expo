import { supabase } from "../lib/supabase";

export const fetchNotes = async () => {
  const { data, error } = await supabase
    .from("note_app")
    .select("*")
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
  return data;
};

// We removed the "reminderDate" argument completely
export const addNote = async (
  title: string,
  note: string,
  isFavorite: boolean,
) => {
  const { error } = await supabase.from("note_app").insert([
    {
      title_text: title,
      note_text: note,
      is_favorite: isFavorite,
    },
  ]);

  if (error) throw error;
};

export const updateNote = async (
  id: number,
  title: string,
  note: string,
  isFavorite: boolean,
) => {
  const { error } = await supabase
    .from("note_app")
    .update({
      title_text: title,
      note_text: note,
      is_favorite: isFavorite,
    })
    .eq("id", id);

  if (error) throw error;
};

export const deleteNote = async (id: number) => {
  const { error } = await supabase.from("note_app").delete().eq("id", id);
  if (error) throw error;
};

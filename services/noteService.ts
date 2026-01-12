import { supabase } from '../lib/supabase';

// 1. Fetch all notes
export const fetchNotes = async () => {
  // Correct Table: note_app
  const { data, error } = await supabase
    .from('note_app') 
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
  
  // OPTIONAL: Map database columns (title_text) to app variables (title)
  // This makes the rest of your app easier to manage
  return data.map((item: { id: number; title_text: string; note_text: string }) => ({
    id: item.id,
    title: item.title_text, // Map from DB column
    note: item.note_text    // Map from DB column
  }));
};

// 2. Add a new note
export const addNote = async (title: string, note: string) => {
  const { error } = await supabase
    .from('note_app')
    .insert([{ 
      title_text: title,  // Insert into correct column
      note_text: note     // Insert into correct column
    }]);
    
  if (error) console.error('Error adding note:', error);
};

// 3. Update an existing note
export const updateNote = async (id: number, title: string, note: string) => {
  const { error } = await supabase
    .from('note_app')
    .update({ 
      title_text: title, // Update correct column
      note_text: note    // Update correct column
    })
    .eq('id', id);
    
  if (error) console.error('Error updating note:', error);
};

// 4. Delete a note
export const deleteNote = async (id: number) => {
  const { error } = await supabase
    .from('note_app')
    .delete()
    .eq('id', id);
    
  if (error) console.error('Error deleting note:', error);
};
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addNote, deleteNote, updateNote } from "../services/noteService";

export default function Editor() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [title, setTitle] = useState(params.title?.toString() || "");
  const [note, setNote] = useState(params.note?.toString() || "");
  const [isFavorite, setIsFavorite] = useState(params.is_favorite === "true");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !note.trim()) {
      Alert.alert("Empty Note", "Please enter a title or a note.");
      return;
    }
    setSaving(true);
    try {
      // Cleaned up: No longer passing null or dates
      if (isEditing) {
        await updateNote(Number(params.id), title, note, isFavorite);
      } else {
        await addNote(title, note, isFavorite);
      }
      router.back();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(Number(params.id));
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.iconBtn}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={28}
              color={isFavorite ? "orange" : "#007AFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtn}>{saving ? "Saving..." : "Done"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.inputTitle}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.inputBody}
        placeholder="Start typing..."
        value={note}
        onChangeText={setNote}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#999"
      />

      {isEditing && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete Note</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 15 },
  cancelBtn: { fontSize: 18, color: "#007AFF" },
  saveBtn: { fontSize: 18, fontWeight: "bold", color: "#007AFF" },
  iconBtn: { padding: 5 },
  inputTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 15 },
  inputBody: { fontSize: 18, flex: 1, lineHeight: 28 },
  deleteBtn: {
    marginTop: 10,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  deleteText: { color: "red", fontSize: 16, fontWeight: "bold" },
});

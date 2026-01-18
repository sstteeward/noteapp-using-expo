import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { fetchNotes } from "../services/noteService";

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State for Filters
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // <--- New Search State

  const loadData = async () => {
    setLoading(true);
    const data = await fetchNotes();
    setNotes(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  useEffect(() => {
    const subscription = supabase
      .channel("note_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "note_app" },
        () => loadData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- FILTER LOGIC ---
  const displayedNotes = notes.filter((note) => {
    // 1. Check Favorite Status
    const matchesFavorite = showFavoritesOnly ? note.is_favorite : true;

    // 2. Check Search Text (Title or Body)
    const query = searchQuery.toLowerCase();
    const title = (note.title_text ?? note.title ?? "").toLowerCase();
    const body = (note.note_text ?? note.note ?? "").toLowerCase();
    const matchesSearch = title.includes(query) || body.includes(query);

    return matchesFavorite && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {showFavoritesOnly ? "Favorites" : "Notes"}
        </Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={[
              styles.iconBtn,
              showFavoritesOnly && styles.activeFilterBtn,
            ]}
          >
            <Ionicons
              name={showFavoritesOnly ? "star" : "star-outline"}
              size={24}
              color={showFavoritesOnly ? "orange" : "#333"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/editor")}
            style={styles.addBtnContainer}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR SECTION */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing" // Adds 'x' button on iOS
        />
        {/* Manual 'X' button for Android if needed, strictly optional */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {/* LIST SECTION */}
      <View style={styles.listContainer}>
        <FlatList
          data={displayedNotes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No matching notes found."
                : showFavoritesOnly
                  ? "No starred notes yet."
                  : 'No notes yet. Tap "+" to start.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                router.push({
                  pathname: "/editor",
                  params: {
                    id: item.id,
                    title: item.title_text ?? item.title,
                    note: item.note_text ?? item.note,
                    is_favorite: item.is_favorite,
                  },
                })
              }
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {item.title_text ?? item.title}
                </Text>
                {item.is_favorite && (
                  <Ionicons name="star" size={16} color="orange" />
                )}
              </View>
              <Text style={styles.itemPreview} numberOfLines={1}>
                {item.note_text ?? item.note}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 10 },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // Reduced slightly to fit search bar
  },
  headerTitle: { fontSize: 34, fontWeight: "800", color: "#333" },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 15 },

  // Buttons
  iconBtn: { padding: 8, borderRadius: 20, backgroundColor: "#f5f5f5" },
  activeFilterBtn: { backgroundColor: "#fff8e1" },
  addBtnContainer: {
    backgroundColor: "#007AFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // SEARCH BAR STYLES
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10, // Taller bar for easier clicking
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  // List
  listContainer: { flex: 1 },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: { fontSize: 18, fontWeight: "600", color: "#222" },
  itemPreview: { fontSize: 15, color: "#888", lineHeight: 20 },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#aaa",
    fontSize: 16,
  },
});

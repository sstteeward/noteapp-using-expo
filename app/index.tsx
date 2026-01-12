import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { fetchNotes } from '../services/noteService';

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchNotes();
    setNotes(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    // Listen for changes in the 'note_app' table
    const subscription = supabase
      .channel('note_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_app' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notes</Text>
        {/* This button sends you to the editor page now */}
        <TouchableOpacity onPress={() => router.push('/editor')}>
          <Text style={styles.addBtn}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notes yet. Tap "+ Add New" to start.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => router.push({ 
                pathname: '/editor', 
                params: { id: item.id, title: item.title, note: item.note } 
              })}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPreview} numberOfLines={1}>{item.note}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10, paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', paddingTop: 0 },
  addBtn: { fontSize: 18, color: '#007AFF', fontWeight: 'bold' },
  listContainer: { flex: 1 },
  listItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemTitle: { fontSize: 18, fontWeight: '600' },
  itemPreview: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});
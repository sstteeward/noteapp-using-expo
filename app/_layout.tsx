import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#f4f4f4' } }}>
      <Stack.Screen name="index" options={{ title: "Notes" }} />
      <Stack.Screen name="editor" options={{ title: "Edit Folder", presentation: 'modal' }} />
    </Stack>
  );
}
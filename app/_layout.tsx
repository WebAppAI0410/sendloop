import { Stack } from 'expo-router';
import { DatabaseProvider } from '../src/database/provider';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="about" />
      </Stack>
    </DatabaseProvider>
  );
}

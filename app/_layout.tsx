import { Stack } from 'expo-router';

export default function RootLayout() {
  // Hide the default expo-router header that can render the route name on web
  return <Stack screenOptions={{ headerShown: false }} />;
}

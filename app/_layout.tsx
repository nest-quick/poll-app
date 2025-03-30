import { Stack } from "expo-router";
import { AuthProvider } from "../features/auth/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

import { useAuth } from "../features/auth/AuthContext";
import { Redirect } from "expo-router";
import { View, Text } from "react-native";

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)/feed" />;
}

import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="create-poll" options={{ title: "Create Poll" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

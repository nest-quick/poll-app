import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{headerShown: false}}>
      <Tabs.Screen name="feed/index" options={{ title: "Feed" }} />
      <Tabs.Screen name="polls/create" options={{ title: "Create Poll" }} />
      <Tabs.Screen name="profile/user" options={{ title: "Profile" }} />
      <Tabs.Screen name="profile/settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="profile/[username]" options={{href: null}}/>
    </Tabs>
  );
}

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "black",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string;

          switch (route.name) {
            case "feed/index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "polls/create":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "profile/user":
              iconName = focused ? "person" : "person-outline";
              break;
            case "profile/settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
            default:
              iconName = "ellipse"; // fallback
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tabs.Screen name="feed/index" options={{ title: "Feed" }} />
      <Tabs.Screen name="polls/create" options={{ title: "Create Poll" }} />
      <Tabs.Screen name="profile/user" options={{ title: "Profile" }} />
      <Tabs.Screen name="profile/settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="profile/[username]" options={{href: null}}/>
    </Tabs>
  );
}

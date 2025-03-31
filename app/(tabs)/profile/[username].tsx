import { useAuth } from "@/features/auth/AuthContext";
import { View, Text, Button, StyleSheet } from "react-native";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
          <Button title="Sign Out" onPress={logout} />
        </>
      ) : (
        <Text>Please log in to view your profile.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },
});

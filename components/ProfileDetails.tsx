// components/ProfileDetails.tsx
import { View, Text, StyleSheet, Image, Button, ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";
import PollCard from "@/components/PollCard";

interface ProfileProps {
  profileData: {
    username: string;
    bio: string;
    profilePicture: string;
    uid: string;
  } | null;
  userPolls: any[];
  loading: boolean;
  showSignOut?: boolean;
}

export default function ProfileDetails({
  profileData,
  userPolls,
  loading,
  showSignOut = false,
}: ProfileProps) {
  const { logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profileData.profilePicture ? (
        <Image source={{ uri: profileData.profilePicture }} style={styles.profileImage} />
      ) : (
        <View style={styles.placeholderImage} />
      )}
      <Text style={styles.username}>@{profileData.username}</Text>
      <Text style={styles.bio}>{profileData.bio || "No bio added yet."}</Text>

      {showSignOut && (
        <Button title="Sign Out" onPress={logout} />
      )}

      <View style={styles.pollSection}>
        <Text style={styles.sectionTitle}>Your Polls</Text>
        {userPolls.length === 0 ? (
          <Text>No polls created yet.</Text>
        ) : (
          userPolls.map((poll) => (
            <PollCard
            key={poll.id}
            id={poll.id}
            question={poll.question}
            options={poll.options}
            votes={poll.votes}
            voters={poll.voters}
            creatorId={poll.creatorId}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  pollSection: {
    marginTop: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pollCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  pollQuestion: {
    fontWeight: "600",
    marginBottom: 5,
  },
});

import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { View, Text, Button, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native"
import { useLocalSearchParams } from "expo-router";

export default function Profile() {
  const { user, logout } = useAuth();
  const { username } = useLocalSearchParams();
  const [profileData, setProfileData] = useState<{username: string; bio: string; profilePicture: string; uid: string;} | null>(null);
  const [loading, setLoading] = useState(true);
  const[userPolls, setUserPolls] = useState<any[]>([]);

  const fetchProfileData = async() => {
    if(!username) return;

    try{
      const q = query(collection(db, "users"), where ("username", "==", username));
      const querySnapshot = await getDocs(q);

      if(querySnapshot.empty){
        console.warn("No user profile data found");
        setProfileData(null);
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      setProfileData({
        username: data.username || "",
        bio: data.bio || "",
        profilePicture: data.profilePicture || "",
        uid: docSnap.id,
      });

      const pollsQuery = query(collection(db, "polls"), where("creatorId", "==", docSnap.id));
      const pollSnapshot = await getDocs(pollsQuery);
      const polls: any[] = [];

      pollSnapshot.forEach((pollDoc) => {
        polls.push({id: pollDoc.id, ...pollDoc.data()});
      });

      setUserPolls(polls);
    }catch(error) {
      console.error("Error fetching user profile: ", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfileData();
    }, [username])
  );

  if(loading){
    return(
      <View style={styles.container}>
        <ActivityIndicator/>
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
    <View style={styles.container}>
      {profileData?.profilePicture ? (
          <Image source={{uri: profileData.profilePicture}} style={styles.profileImage}/>
      ) : (
        <View style={styles.placeholderImage}/>
      )}
      <Text style={styles.username}>@{profileData?.username}</Text>
      <Text style={styles.bio}>{profileData?.bio || "No bio added yet."}</Text>
      {user?.uid === profileData.uid && (
        <Button title="Sign Out" onPress={logout} />
      )}
      <View style={styles.pollSection}>
        <Text style={styles.sectionTitle}>Your Polls</Text>
        {userPolls.length === 0 ? (
          <Text>No polls created yet.</Text>
        ) : (
          userPolls.map((poll) => (
            <View key={poll.id} style={styles.pollCard}>
              <Text style={styles.pollQuestion}>{poll.question}</Text>
              {/* Optionally show votes */}
              {poll.options?.map((opt: string) => (
                <Text key={opt}>
                  {opt} - {poll.votes?.[opt] || 0} votes
                </Text>
              ))}
            </View>
          ))
        )}
      </View>

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  email: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
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

import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { View, Text, Button, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native"
import { useLocalSearchParams } from "expo-router";
import ProfileDetails from "@/components/ProfileDetails";

export default function MyProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<{username: string; bio: string; profilePicture: string; uid: string;} | null>(null);
  const [loading, setLoading] = useState(true);
  const[userPolls, setUserPolls] = useState<any[]>([]);

  const fetchProfileData = async() => {
    if(!user?.uid) return;

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (!userSnap.exists()) {
          setProfileData(null);
          return;
        }
  
        const data = userSnap.data();
  
        setProfileData({
          username: data.username || "",
          bio: data.bio || "",
          profilePicture: data.profilePicture || "",
          uid: user.uid,
        });
  
        const pollsQuery = query(collection(db, "polls"), where("creatorId", "==", user.uid));
        const pollSnapshot = await getDocs(pollsQuery);
        const polls = pollSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        setUserPolls(polls);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
  
    useFocusEffect(useCallback(() => {
      setLoading(true);
      fetchProfileData();
    }, [user?.uid]));

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
    <ProfileDetails
      profileData={profileData}
      userPolls={userPolls}
      loading={loading}
      showSignOut={true}
    />
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
import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { View, Text, Button, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native"

export default function Profile() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<{username: string; bio: string; profilePicture: string;} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async() => {
    if(user) {
      try{
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            username: data.username || "",
            bio: data.bio || "",
            profilePicture: data.profilePicture || "",
          });
        }
        else{
          console.warn("No user profile data found.");
        }
      } catch(error) {
        console.error("Error fetching user profile: ", error);
      } finally {
        setLoading(false);
      }
    }
  };
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfileData();
    }, [user])
  );

  if(!user) {
    return (
      <View>
        <Text>Please log in to view your profile.</Text>
      </View>
    );
  }

  if(loading){
    return(
      <View style={styles.container}>
        <ActivityIndicator/>
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
      <Button title="Sign Out" onPress={logout} />
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
});

import { useAuth } from "@/features/auth/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View, Text, Image, Button, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";


export default function Settings(){
    const { user } = useAuth();
    const [bio, setBio] = useState("");
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadUserData = async() => {
            if(!user) return;

            try{
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if(docSnap.exists()){
                    const data = docSnap.data();
                    setBio(data.bio || "");
                    setImageBase64(data.profilePicture || null);
                }
            }catch(err){
                console.error("Error loadig user data", err);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    const pickImage = async() => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            quality: 0.5,
        });

        if(!result.canceled) {
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async() => {
        if(!user) return;

        setSaving(true);
        try{
            await updateDoc(doc(db, "users", user.uid), {
                bio,
                profilePicture: imageBase64,
            });

            Alert.alert("Profile Updated", "Your profile changes have been saved");
        }catch(err){
            console.error("Error saving profile", err);
            Alert.alert("Error", "Could not save your profile");
        }finally{
            setSaving(false);
        }
    };
    if (!user || loading) {
        return (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        );
    }
    
    return(
        <View style={styles.container}>
            <Text style={styles.label}>Profile Picture</Text>
            {imageBase64 ? (
                <Image source={{ uri: imageBase64 }} style={styles.profileImage} />
            ) : (
                <View style={styles.placeholderImage} />
            )}
            <Button title="Choose Image" onPress={pickImage} />

            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Write something about yourself..."
                multiline
            />

            <Button title={saving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={saving} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
    },
    label: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: "600",
    },
    input: {
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 6,
      padding: 10,
      marginTop: 10,
      marginBottom: 20,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginTop: 10,
      marginBottom: 10,
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "#eee",
      marginTop: 10,
      marginBottom: 10,
    },
  });
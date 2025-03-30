import React, { useState, useEffect } from "react";
import { FlatList, View, Text, RefreshControl, StyleSheet } from "react-native";
import { db } from "../../lib/firebaseConfig";
import { getDocs, collection, query, orderBy } from "firebase/firestore";

export default function Feed() {
  const [polls, setPolls] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolls = async () => {
    try {
      const pollSnapshot = await getDocs(query(collection(db, "polls"), orderBy("createdAt", "desc")));
      const fetchedPolls = pollSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPolls(fetchedPolls);
    } catch (error) {
      console.error("Error fetching polls: ", error);
    }
  };

  // This function will be triggered when the user pulls to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolls().then(() => {
      setRefreshing(false); // Stop the refresh animation once data is fetched
    });
  };

  // Fetch polls initially when the component mounts
  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.pollItem}>
            <Text style={styles.pollText}>{item.question}</Text>
            {item.options.map((option: string, index: number) => (
              <Text key={index} style={styles.optionText}>
                {option}
              </Text>
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  pollItem: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  pollText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 16,
    marginTop: 5,
  },
});

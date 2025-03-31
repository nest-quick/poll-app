import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import PollCard from "@/components/PollCard";
import { getPolls, Poll } from "@/features/polls/PollService";

export default function FeedScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolls = async () => {
    const fetchedPolls = await getPolls();
    setPolls(fetchedPolls);
    setLoading(false);
    setRefreshing(false); // Stop refresh animation after data loads
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolls();
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PollCard {...item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  list: { paddingHorizontal: 10 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

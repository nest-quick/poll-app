import { useState, useEffect } from "react";
import { View, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import PollCard from "@/components/PollCard";
import { fetchPolls } from "@/features/polls/PollService";

export default function Feed() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadPolls = async () => {
    setLoading(true);
    const data = await fetchPolls();
    setPolls(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPolls();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPolls();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PollCard 
            id={item.id} 
            question={item.question} 
            options={item.options} 
            votes={item.votes} 
            voters={item.voters} 
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
  
}
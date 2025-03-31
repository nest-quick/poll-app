import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { voteOnPoll } from "@/features/polls/PollService";

export interface PollCardProps {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // Map structure
}

export default function PollCard({ id, question, options, votes }: PollCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.voteButton}
          onPress={() => voteOnPoll(id, index)}
        >
          <Text style={styles.optionText}>
            {option} - {votes?.[index] ?? 0} votes
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  question: { fontWeight: "bold", fontSize: 18 },
  voteButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  optionText: { color: "#fff", textAlign: "center" },
});

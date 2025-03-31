import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { voteOnPoll } from "@/features/polls/PollService";
import { auth } from "@/lib/firebaseConfig";

export interface PollCardProps {
  id: string;
  question: string;
  options: string[];
  votes?: Record<string, number>;
  voters?: {[userId: string]: string};
}

export default function PollCard({ id, question, options, votes = {}, voters ={}}: PollCardProps) {
  const [localVotes, setLocalVotes] = useState(votes);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const hasVoted = Boolean(votedOption);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    } else {
      console.warn("User is not authenticated");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setVotedOption(voters[userId] || null);
    }
  }, [voters, userId]);

  const handleVote = async (option: string) => {
    console.log("Attempting to vote with userId:", userId);

    if (!userId) {
      console.error("Error: User is not authenticated.");
      return;
    }

    if (votedOption) return; // Prevent multiple votes

    try {
      await voteOnPoll(id, userId, option);
      setLocalVotes((prev) => ({ ...prev, [option]: (prev[option] || 0) + 1 }));
      setVotedOption(option);
    } catch (error) {
      console.error("Error voting2:", error);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      {options.map((option, index) => (
        <TouchableOpacity
        key={index}
        style={[styles.optionButton, 
          votedOption === option && styles.votedButton,
          hasVoted && votedOption !== option && styles.disabledButton]}
        onPress={() => handleVote(option)}
        disabled={hasVoted}
      >
        <Text style={styles.optionText}>
          {option} - {localVotes[option] || 0} votes
        </Text>
      </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  question: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6", // Greyed out when voting is disabled
  },
  optionButton: {
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  votedButton: {
    backgroundColor: "red", // Highlight the voted option
  },
});

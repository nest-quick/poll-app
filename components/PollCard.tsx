import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useEffect, useState } from "react";
import { voteOnPoll } from "@/features/polls/PollService";
import { auth, db  } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export interface PollCardProps {
  id: string;
  question: string;
  options?: string[];
  votes?: Record<string, number>;
  voters?: {[userId: string]: string};
  creatorId: string;
}

export default function PollCard({ id, question, options = [], votes = {}, voters ={}, creatorId}: PollCardProps) {
  const [localVotes, setLocalVotes] = useState(votes);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const hasVoted = Boolean(votedOption);
  const [userId, setUserId] = useState<string | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string>("");
  const [creatorProfilePicture, setCreatorProfilePicture] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchCreatorInfo = async() => {
      if (!creatorId) return;

      try{
        const docRef = doc(db, "users", creatorId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
          const data = docSnap.data();
          setCreatorUsername(data.username || "Unknown");
          setCreatorProfilePicture(data.profilePicture || null);
        }
      }catch(error) {
        console.error("Error fetching creator info: ", error);
      }
    };

    fetchCreatorInfo();
  }, [creatorId]);

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
      <View style={styles.creatorRow}>
        {creatorProfilePicture ? (
          <Image source={{ uri: creatorProfilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <Text style={styles.username}>@{creatorUsername}</Text>
      </View>
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
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  
});

import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { voteOnPoll, addCommentToPoll, getCommmentForPoll } from "@/features/polls/PollService";
import { auth, db  } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "expo-router";

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
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);

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

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async() => {
    try{
      const fetched = await getCommmentForPoll(id);

      //Fetch user info for each comment
      const commentsWithUserData = await Promise.all(
        fetched.map(async (comment: any) => {
          try{
            const userRef = doc(db, "users", comment.userId);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
              const userData = userSnap.data();
              return{
                ...comment,
                username: userData.username,
                profilePicture: userData.profilePicture || null,
              };
            }
          }catch(error){
            console.error("Error fetching comment user info: ", error);
          }
        })
      );

      setComments(commentsWithUserData);
    }catch(error){
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async() => {
    if(!userId || !commentInput.trim()) return;

    try{
      await addCommentToPoll(id, userId, commentInput.trim());
      setCommentInput("");
      fetchComments();
    }catch(error){
      console.error("Error adding comment: ", error);
    }
  };

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
      console.error("Error voting:", error);
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
        <Link href={`/profile/${creatorUsername}`} asChild>
        <TouchableOpacity>
        <Text style={styles.username}>@{creatorUsername}</Text>
        </TouchableOpacity>
        </Link>
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
          {option} - Votes {localVotes[option] || 0}
        </Text>
      </TouchableOpacity>
      ))}
      <View style={styles.commentSection}>
        <TouchableOpacity
          onPress={() => setShowComments((prev) => !prev)}
        >
          <Text style={styles.sectionTitle}>
            Comments {showComments ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
        {showComments && (
          <>
            {comments.length === 0 ? (
              <Text style={styles.commentText}>No comments yet.</Text>
            ): (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  {comment.profilePicture ? (
                    <Image source={{ uri: comment.profilePicture }} style={styles.commentAvatar} />
                  ) : (
                    <View style={styles.commentAvatarPlaceholder} />
                  )}
                  <View>
                    <Text style={styles.commentUsername}>@{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              ))
            )}

            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Write a comment...."
              style={styles.input}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
              <Text style={styles.commentButtonText}>Post</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
    color: "white",
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
  commentSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  commentButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  commentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  commentUsername: {
    fontWeight: "600",
    marginBottom: 2,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  
});

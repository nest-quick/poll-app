import { collection, getDocs, doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";

//Fetch Polls
export const fetchPolls = async () => {
  const querySnapshot = await getDocs(collection(db, "polls"));
  return querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
};

//Vote on Poll
export const voteOnPoll = async (pollId: string, userId: string, option: string) => {
  if (!auth.currentUser || !userId) {
    console.error("Error: Invalid user ID");
    return;
  }

  const pollRef = doc(db, "polls", pollId);

  try {
    console.log(`Voting on poll: ${pollId}, userId: ${userId}, option: ${option}`);
    
    await updateDoc(pollRef, {
      [`votes.${option}`]: increment(1), // Increment vote count for the option
      [`voters.${userId}`]: option, // Store the user's vote
    });
  } catch (error) {
    console.error("Error voting1:", error);
    throw new Error("Failed to submit vote");
  }
};

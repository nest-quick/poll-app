import { collection, getDocs, doc, updateDoc, increment, addDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";

//Fetch Polls
export const fetchPolls = async () => {
  const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
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

//Add Comment to Poll
export const addCommentToPoll = async(pollId: string, userId:string, text: string) => {
  const commentRef = collection(db, "polls", pollId, "comments");
  await( addDoc(commentRef, {
    text, 
    userId, 
    createdAt: serverTimestamp(),
  }));
};

//See Comment from Poll
export const getCommmentForPoll = async(pollId: string) => {
  const commentsRef = collection(db, "polls", pollId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
};

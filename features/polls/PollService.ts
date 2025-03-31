import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Ensure the path is correct

// Define the structure of a poll
export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // Map structure for votes
}

// Fetch polls from Firestore
export async function getPolls(): Promise<Poll[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "polls"));
      const polls: Poll[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Poll, "id">; // Exclude 'id' from the spread
        return { id: doc.id, ...data }; // Now id is assigned only once
      });
      return polls;
    } catch (error) {
      console.error("Error fetching polls:", error);
      return [];
    }
  }  

// Handle voting
export async function voteOnPoll(pollId: string, optionIndex: number) {
  try {
    const pollRef = doc(db, "polls", pollId);

    // Increment the vote count in Firestore
    await updateDoc(pollRef, {
      [`votes.${optionIndex}`]: increment(1),
    });
  } catch (error) {
    console.error("Error voting on poll:", error);
  }
}

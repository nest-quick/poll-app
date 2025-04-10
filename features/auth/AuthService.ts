import { auth, db } from "../../lib/firebaseConfig";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const registerUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const saveUserToFirestore = async (userId: string, username: string, email: string) => {
  try {
    await setDoc(doc(db, "users", userId), {
      username,
      email,
      bio: "",
      profilePicture: "",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, query, setDoc, updateDoc, where, getDocs } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  friends: string[];
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  addFriendByEmail: (email: string) => Promise<void>;
  removeFriend: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = undefined;
      }

      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(
        userRef,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          friends: [],
        },
        { merge: true }
      );

      profileUnsubscribe = onSnapshot(userRef, (snapshot) => {
        const data = snapshot.data();
        if (!data) {
          setProfile(null);
        } else {
          setProfile({
            uid: firebaseUser.uid,
            email: String(data.email ?? firebaseUser.email ?? ""),
            displayName: String(data.displayName ?? firebaseUser.displayName ?? ""),
            friends: Array.isArray(data.friends) ? data.friends : [],
          });
        }
        setLoading(false);
      });
    });

    return () => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
      unsubscribeAuth();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUp = async (displayName: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: displayName.trim() });
    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        uid: credential.user.uid,
        email: credential.user.email ?? email.trim(),
        displayName: displayName.trim(),
        friends: [],
      },
      { merge: true }
    );
  };

  const signOutUser = async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
  };

  const addFriendByEmail = async (email: string) => {
    if (!user) return;

    const friendEmail = email.trim().toLowerCase();
    if (!friendEmail) return;

    const matches = await getDocs(query(collection(db, "users"), where("email", "==", friendEmail)));
    if (matches.empty) {
      throw new Error("No user found with that email.");
    }

    await updateDoc(doc(db, "users", user.uid), {
      friends: arrayUnion(friendEmail),
    });
  };

  const removeFriend = async (email: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      friends: arrayRemove(email),
    });
  };

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signUp, signOutUser, addFriendByEmail, removeFriend }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

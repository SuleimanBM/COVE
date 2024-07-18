import { firestore, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export type Message = {
  id: string;
  name: string;
  userId: string;
  lastMessage: string;
  profilePicture: string | null;
  timestamp: string;
  formattimestamp: string;
};

export const useChannelMessages = (
  spaceId: string,
  channelId: string
): Message[] => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!spaceId || !channelId) {
      console.error("Invalid spaceId or channelId");
      return;
    }

    const unsubscribe = onSnapshot(
      query(
        collection(
          firestore,
          "spaces",
          spaceId,
          "channels",
          channelId,
          "messages"
        ),
        orderBy("timestamp")
      ),
      (snapshot) => {
        const newMessages: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name ?? "Unknown", // Provide default value
            userId: data.userId ?? "Unknown", // Provide default value
            lastMessage: data.lastMessage ?? "",
            profilePicture: null, // No profile picture fetched here
            timestamp: data.timestamp ?? "",
            formattimestamp: data.formattimestamp ?? "",
          };
        });
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [spaceId, channelId]);

  return messages;
};

export const sendMessageToChannel = async (
  spaceId: string,
  channelId: string,
  message: string
) => {
  const user: User | null = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const userDocRef = doc(firestore, "userDetails", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const userDetails = userDocSnap.data();

    if (!userDetails) {
      throw new Error("User details not found");
    }

    const displayName = userDetails.displayName ?? "Unknown";
    const profilePicture = userDetails.profilePicture ?? null;

    await addDoc(
      collection(
        firestore,
        "spaces",
        spaceId,
        "channels",
        channelId,
        "messages"
      ),
      {
        name: displayName,
        userId: user.uid, // Add userId field
        lastMessage: message,
        profilePicture: profilePicture,
        timestamp: new Date().toISOString(),
        formattimestamp: new Date()
          .toISOString()
          .slice(0, 16)
          .replace("T", " "),
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { firestore, auth } from "../firebaseConfig";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface User {
  uid: string;
  displayName: string;
  profilePicture: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const { chatId, friend } = useLocalSearchParams();
  const parsedFriend: User = JSON.parse(friend as string);

  useEffect(() => {
    const fetchMessages = () => {
      const messagesQuery = query(
        collection(firestore, "chats", chatId as string, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const messagesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Message
        );
        setMessages(messagesData);
      });

      return unsubscribe;
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const message = {
      senderId: user.uid,
      text: newMessage,
      timestamp: Date.now(),
    };

    await addDoc(
      collection(firestore, "chats", chatId as string, "messages"),
      message
    );
    setNewMessage("");
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUserMessage = item.senderId === auth.currentUser?.uid;
    return (
      <View
        style={[
          styles.messageItem,
          isUserMessage ? styles.userMessage : styles.friendMessage,
        ]}
      >
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: parsedFriend.profilePicture }}
          style={styles.profilePicture}
        />
        <Text style={styles.displayName}>{parsedFriend.displayName}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  displayName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  userMessage: {
    backgroundColor: "#f4f4f4",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    padding: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#800000",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Pressable
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
import { translateText, detectLanguage } from "@/translationService";
import * as Localization from "expo-localization";


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
   const [translatedMessages, setTranslatedMessages] = useState<{
     [key: string]: string;
   }>({});
   const [translationStates, setTranslationStates] = useState<{
     [key: string]: boolean;
   }>({});
   const [defaultLanguage, setDefaultLanguage] = useState<string>(
     Localization.locale.split("-")[0]
   );
    const [detectedLanguages, setDetectedLanguages] = useState<{
      [key: string]: string;
    }>({});

  useEffect(() => {
    const fetchMessages = () => {
      const messagesQuery = query(
        collection(firestore, "chats", chatId as string, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
        const messagesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Message
        );
        // Detect language for each new message
        for (const message of messagesData) {
          const detectedLang = await detectLanguage(message.text);
          setDetectedLanguages((prev) => ({
            ...prev,
            [message.id]: detectedLang,
          }));
        }
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

     const handleTranslate = async (id: string, text: string) => {
       if (translationStates[id]) {
         // If the message is already translated, revert to the original text
         setTranslationStates((prev) => ({ ...prev, [id]: false }));
       } else {
         const translatedText = await translateText(text);
         setTranslatedMessages((prev) => ({ ...prev, [id]: translatedText }));
         setTranslationStates((prev) => ({ ...prev, [id]: true }));
       }
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
        <Text>
          {translationStates[item.id]
            ? translatedMessages[item.id]
            : item.text}
        </Text>
       {detectedLanguages[item.id] !== defaultLanguage && (
          <Pressable onPress={() => handleTranslate(item.id, item.text)}>
            <Text style={styles.Translate}>
              {translationStates[item.id]
                ? "Show Original"
                : `Translate to ${defaultLanguage}`}
            </Text>
          </Pressable>
       )}
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
  Translate: {
    color: "#aaa",
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

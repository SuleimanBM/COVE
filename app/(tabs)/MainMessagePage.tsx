import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { useChannelMessages, sendMessageToChannel } from "./API";

export type Message = {
  id: string;
  name: string;
  userId: string; // Add userId field
  lastMessage: string;
  profilePicture: string | null;
  timestamp: string;
  formattimestamp: string;
};

const width = Dimensions.get("window").width;

const MainMessagePage: React.FC = () => {
  const { spaceId, channelId } = useLocalSearchParams();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");
  const [messagesWithProfilePictures, setMessagesWithProfilePictures] =
    useState<Message[]>([]);

  if (typeof spaceId !== "string" || typeof channelId !== "string") {
    return <Text>Error: Invalid spaceId or channelId</Text>;
  }

  const messages: Message[] = useChannelMessages(spaceId, channelId);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchChannelDetails = async () => {
      const channelDoc = await getDoc(
        doc(firestore, `spaces/${spaceId}/channels/${channelId}`)
      );
      if (channelDoc.exists()) {
        setChannelName(channelDoc.data().name);
      } else {
        setChannelName("Unknown Channel");
      }
    };
    fetchChannelDetails();
  }, [spaceId, channelId]);

  useEffect(() => {
    const fetchUserProfilePictures = async () => {
      const messagesWithProfilePictures = await Promise.all(
        messages.map(async (msg) => {
          const userDocRef = doc(firestore, "userDetails", msg.userId);
          const userDocSnap = await getDoc(userDocRef);
          const userDetails = userDocSnap.data();
          const profilePicture = userDetails?.profilePicture ?? null;
          return {
            ...msg,
            profilePicture,
          };
        })
      );
      setMessagesWithProfilePictures(messagesWithProfilePictures);
    };

    fetchUserProfilePictures();
  }, [messages]);

  const sortedMessages = messagesWithProfilePictures.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [sortedMessages]);

  const handleSendMessage = async () => {
    try {
      await sendMessageToChannel(spaceId, channelId, inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const hashStringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageItem}>
      {item.profilePicture && (
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      )}
      <View style={styles.messageText}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            alignItems: "center",
          }}
        >
          <Text style={[styles.name, { color: hashStringToColor(item.name) }]}>
            {item.name}
          </Text>
          <Text style={styles.Translate}>{item.formattimestamp}</Text>
        </View>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        <Pressable>
          <Text style={styles.Translate}>Translate to English</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.TopBar}>
        <Text style={styles.Intro}>{channelName}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  TopBar: {
    padding: "10@s",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  Intro: {
    fontSize: "18@s",
    fontWeight: "bold",
  },
  messageItem: {
    flexDirection: "row",
    padding: "10@s",

    borderBottomColor: "#ddd",
  },
  avatar: {
    width: "40@s",
    height: "40@s",
    borderRadius: "20@s",
    marginRight: "10@s",
  },
  messageText: {
    flex: 1,
  },
  name: {
    fontWeight: "300",
  },
  Translate: {
    color: "#aaa",
  },
  lastMessage: {
    marginTop: "2@s",
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    padding: "10@s",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: "10@s",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: "20@s",
    marginRight: "10@s",
  },
  sendButton: {
    backgroundColor: "#800000",
    borderRadius: "20@s",
    justifyContent: "center",
    paddingHorizontal: "20@s",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MainMessagePage;

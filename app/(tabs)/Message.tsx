import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from "react-native";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { firestore, auth } from "../firebaseConfig";

interface User {
  uid: string;
  displayName: string;
  profilePicture: string;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
}

export default function SpacesScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchedFriends, setMatchedFriends] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [otherUsers, setOtherUsers] = useState<{ [key: string]: User }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      const user = auth.currentUser;
      if (user) {
        const chatsQuery = query(
          collection(firestore, "chats"),
          where("participants", "array-contains", user.uid)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        const chatsData = chatsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Chat
        );
        setChats(chatsData);

        const otherUserIds = chatsData
          .flatMap((chat) => chat.participants)
          .filter((uid) => uid !== user.uid);
        const otherUsersData = await Promise.all(
          otherUserIds.map(async (uid) => {
            const userDoc = await getDoc(doc(firestore, "userDetails", uid));
            return { uid, ...userDoc.data() } as User;
          })
        );
        const otherUsersMap = Object.fromEntries(
          otherUsersData.map((user) => [user.uid, user])
        );
        setOtherUsers(otherUsersMap);
      }
    };

    fetchChats();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const friendsQuery = query(
        collection(firestore, "userDetails"),
        where("displayName", ">=", text),
        where("displayName", "<=", text + "\uf8ff")
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendsData = friendsSnapshot.docs.map(
        (doc) => ({ uid: doc.id, ...doc.data() }) as User
      );
      setMatchedFriends(friendsData);
    } else {
      setMatchedFriends([]);
    }
  };

  const startChat = async (friend: User) => {
    const user = auth.currentUser;
    if (!user) return;

    const chatId = [user.uid, friend.uid].sort().join("_");
    const chatRef = doc(firestore, "chats", chatId);

    const chatSnapshot = await getDoc(chatRef);

    if (!chatSnapshot.exists()) {
      await setDoc(chatRef, {
        participants: [user.uid, friend.uid],
        messages: [],
      });
    }

    router.push({
      pathname: "/ChatPage",
      params: { chatId, friend: JSON.stringify(friend) },
    });
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherUser = item.participants
      .map((uid) => otherUsers[uid])
      .find((user) => user && user.uid !== auth.currentUser?.uid);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/ChatPage",
            params: { chatId: item.id, friend: JSON.stringify(otherUser) },
          })
        }
        style={styles.chatItem}
      >
        {otherUser && (
          <>
            <Image
              source={{ uri: otherUser.profilePicture }}
              style={styles.profilePicture}
            />
            <View>
              <Text style={styles.displayName}>{otherUser.displayName}</Text>
              <Text style={styles.lastMessage}>
                {item.lastMessage}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Messages</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Friends"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={matchedFriends}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text>{item.displayName}</Text>
            <TouchableOpacity onPress={() => startChat(item)}>
              <Text style={styles.messageButton}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View>
            {chats.length > 0 && <Text style={styles.sectionTitle}>Chats</Text>}
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 25,
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  searchContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 16,
    gap: 10,
    width: 320,
    height: 50,
    backgroundColor: "#FAF2F2",
    marginBottom: 30,
    borderWidth: 1,
  },
  searchInput: { 
    color: "#000000",
     margin: 30,
    borderWidth: 1,
    padding: 10,
    borderRadius: 15,
    borderColor: "#800000",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  messageButton: { color: "blue" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  button: {
    backgroundColor: "#800000",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18 },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  displayName: {
    fontWeight: "bold",
  },
  lastMessage: {
    color: "#666",
  },
});

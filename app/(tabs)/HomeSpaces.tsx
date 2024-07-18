import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { firestore,auth } from "../firebaseConfig";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import AddChannelBottomSheet from "./AddChannel";

export type Channel = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
};
export type Space = {
  id: string;
  name: string;
  description: string;
  sIcon: string | null;
   createdBy: string;
  members: string[];
};

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [space, setSpace] = useState<Space | null>(null);
  const [isAddChannelVisible, setIsAddChannelVisible] = useState(false);
  const [isshowAddChannelButton, setIsshowAddChannelButton] = useState(true);
  const { spaceId } = useLocalSearchParams(); // Get spaceId from params
  const router = useRouter();

  useEffect(() => {
    if (!spaceId) return;

    // Fetch the space details
    const fetchSpaceDetails = async () => {
      const spaceDoc = await getDoc(doc(firestore, `spaces/${spaceId}`));
      if (spaceDoc.exists()) {
        const spaceData = spaceDoc.data();
        setSpace({
          id: spaceDoc.id,
          name: spaceData.name,
          description: spaceData.description,
          sIcon: spaceData.icon,
          createdBy: spaceData.createdBy,
          members: spaceData.members,
        });
      }
    };

    fetchSpaceDetails();
  }, [spaceId]);

  useEffect(() => {
    if (!spaceId) return;

    const q = query(collection(firestore, `spaces/${spaceId}/channels`));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newChannels: Channel[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        icon: doc.data().icon,
      }));
      setChannels(newChannels);
    });

    return () => unsubscribe();
  }, [spaceId]);

  const handleChannelPress = (channelId: string) => {
    router.push({
      pathname: "/MainMessagePage", // Update to the correct route if needed
      params: { spaceId, channelId },
    });
  };
  const handle = async (channelName: string, channelDescription: string) => {
    if (!space || space.createdBy !== auth.currentUser?.uid) {
      setIsshowAddChannelButton(false)
      return;
    }}
  return (
    <View style={styles.container}>
      {space && (
        <View style={styles.spaceDetails}>
          <Image
            source={
              space.sIcon
                ? { uri: space.sIcon }
                : require("../../assets/images/Profile.svg")
            }
            style={styles.spaceIcon}
          />
          <View style={styles.saceName}>
            <Text style={styles.spaceName}>{space.name}</Text>
            <Text style={styles.spaceDescription}>{space.description}</Text>
          </View>
        </View>
      )}
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.channelItem}
            onPress={() => handleChannelPress(item.id)}
          >
            <Image
              source={
                item.icon
                  ? { uri: item.icon }
                  : require("../../assets/images/Profile.svg")
              }
              style={styles.channelIcon}
            />
            <Text style={styles.channelName}>{item.name}</Text>
          </Pressable>
        )}
      />
    {isshowAddChannelButton? 
    <TouchableOpacity
        style={styles.button}
        onPress={() => setIsAddChannelVisible(true)}
      >
        <Text style={styles.buttonText}>+ Add Channel</Text>
      </TouchableOpacity>
      : null

    }
      <AddChannelBottomSheet
        isVisible={isAddChannelVisible}
        onClose={() => setIsAddChannelVisible(false)}
        spaceId={spaceId as string}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  saceName: {
    position: "absolute",
    backgroundColor: "#3a3a3a",
    borderRadius: "20@ms",
    paddingHorizontal: "10@ms",
    top: "20@ms",
    left: "5@ms",
  },
  spaceDetails: {
    alignItems: "center",
    padding: "3@s",
    width: "100%",
    height: "20%",

    marginTop: "25@s",
    marginBottom: "10@s",
  },
  spaceIcon: {
    width: "100%",
    height: "170@ms",
    borderTopLeftRadius: "30@ms",
    borderTopRightRadius: "30@ms",
    borderBottomWidth: 3,
    borderBottomColor: "#800000",
  },
  spaceName: {
    fontSize: "15@ms",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: "5@ms",
    color: "#ffffff",
  },
  spaceDescription: {
    fontSize: "12@ms",

    textAlign: "center",
    marginVertical: "5@ms",
    color: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10@ms",
  },
  spacesContainer: {
    flexDirection: "row",
  },
  spaceItem: {
    marginRight: "10@ms",
  },
  spaceImage: {
    width: "50@ms",
    height: "50@ms",
    borderRadius: "25@ms",
  },
  messageIconContainer: {
    padding: "10@ms",
  },
  messageIcon: {
    width: "30@ms",
    height: "30@ms",
  },
  clubImage: {
    width: "100%",
    height: "170@ms",
    borderTopLeftRadius: "30@ms",
    borderTopRightRadius: "30@ms",
  },
  clubName: {
    fontSize: "15@ms",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: "10@ms",
    color: "#ffffff",
  },
  searchInput: {
    backgroundColor: "#f1f1f1",
    borderRadius: "20@ms",
    padding: "10@ms",
    margin: "10@ms",
  },
  channelContainer: {
    padding: "10@ms",
  },
  channelTitle: {
    fontSize: "20@ms",
    fontWeight: "bold",
    marginBottom: "5@ms",
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "15@ms",
    borderBottomWidth: 1,
    borderBottomColor: "#800000",
  },
  channelIcon: {
    fontSize: "18@ms",
    marginRight: "10@ms",
  },
  channelName: {
    fontSize: "18@ms",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: "10@ms",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: "30@ms",
    height: "30@ms",
  },
  navText: {
    fontSize: "12@ms",
    marginTop: "5@ms",
  },
  button: {
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 50,
    width: 280,
    height: 50,
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

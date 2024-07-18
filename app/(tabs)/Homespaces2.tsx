import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { firestore, auth } from "../firebaseConfig";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import AddChannelBottomSheet from "./AddChannel"; // Ensure this path is correct

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
  const [isShowAddChannelButton, setIsShowAddChannelButton] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { spaceId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!spaceId) return;

    const fetchSpaceDetails = async () => {
      try {
        const spaceDoc = await getDoc(doc(firestore, `spaces/${spaceId}`));
        if (spaceDoc.exists()) {
          const spaceData = spaceDoc.data() as Space;
          setSpace({
            id: spaceDoc.id,
            name: spaceData.name,
            description: spaceData.description,
            sIcon: spaceData.sIcon,
            createdBy: spaceData.createdBy,
            members: spaceData.members,
          });
          setIsShowAddChannelButton(
            spaceData.createdBy === auth.currentUser?.uid
          );
        } else {
          console.log("Space not found");
        }
      } catch (error) {
        console.error("Error fetching space details: ", error);
      } finally {
        setIsLoading(false);
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
      pathname: "/MainMessagePage",
      params: { spaceId, channelId },
    });
  };

  const shareSpaceLink = async () => {
    if (!space) return;

    try {
      const result = await Share.share({
        message: `Join the space "${space.name}" on our app: app://spaces/${space.id}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type of: " + result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Dismissed");
      }
    } catch (error) {
      console.error("Error sharing space link: ", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
          <View style={styles.spaceNameContainer}>
            <Text style={styles.spaceName}>{space.name}</Text>
            <Text style={styles.spaceDescription}>{space.description}</Text>
          </View>
          <Pressable style={styles.shareButton} onPress={shareSpaceLink}>
            <Text style={styles.shareButtonText}>Share Space Link</Text>
          </Pressable>
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
      {isShowAddChannelButton && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsAddChannelVisible(true)}
        >
          <Text style={styles.buttonText}>+ Add Channel</Text>
        </TouchableOpacity>
      )}
      {isAddChannelVisible && ( // Ensure the component is rendered correctly
        <AddChannelBottomSheet
          isVisible={isAddChannelVisible}
          onClose={() => setIsAddChannelVisible(false)}
          spaceId={spaceId as string}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spaceDetails: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  spaceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  spaceNameContainer: {
    marginLeft: 10,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  spaceDescription: {
    fontSize: 14,
    color: "#888",
  },
  shareButton: {
    marginLeft: "auto",
  },
  shareButtonText: {
    color: "#007AFF",
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  channelName: {
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

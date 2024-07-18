import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { firestore, auth, storage } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type Space = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  createdBy: string;
  createdAt: Date;
  members: string[]; // Add members array to Space type
};

export default function SpacesScreen() {
  const [spaceName, setSpaceName] = useState<string>("");
  const [spaceDescription, setSpaceDescription] = useState<string>("");
  const [spaceIcon, setSpaceIcon] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBottomSheetModalOpen, setIsBottomSheetModalOpen] =
    useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserSpaces = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(firestore, "spaces"),
        where("members", "array-contains", user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newSpaces: Space[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          icon: doc.data().icon,
          createdBy: doc.data().createdBy,
          createdAt: doc.data().createdAt.toDate(),
          members: doc.data().members, // Get members array from Firestore
        }));
        setSpaces(newSpaces);
      });

      return () => unsubscribe();
    };

    fetchUserSpaces();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSpaceIcon(result.assets[0].uri);
    }
  };

  const handleCreateSpace = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      let iconUrl = null;
      if (spaceIcon) {
        const response = await fetch(spaceIcon);
        const blob = await response.blob();
        const iconRef = ref(storage, `spaceIcons/${new Date().toISOString()}`);
        await uploadBytes(iconRef, blob);
        iconUrl = await getDownloadURL(iconRef);
      }

      const newSpaceRef = await addDoc(collection(firestore, "spaces"), {
        name: spaceName,
        description: spaceDescription,
        icon: iconUrl,
        createdBy: user.uid,
        createdAt: new Date(),
        members: [user.uid], // Add the current user as a member of the new space
      });

      await createDefaultChannel(newSpaceRef.id);

      setSpaceName("");
      setSpaceDescription("");
      setSpaceIcon(null);
      setIsBottomSheetModalOpen(false);
      bottomSheetModalRef.current?.close(); // Close the bottom sheet
    } catch (error) {
      console.error("Error creating space:", error);
    }
    setIsLoading(false);
  };

  const createDefaultChannel = async (spaceId: string) => {
    const defaultChannelRef = doc(
      firestore,
      `spaces/${spaceId}/channels/introduction`
    );
    await setDoc(defaultChannelRef, {
      name: "Introduction",
      description: "This is the introduction channel.",
      icon: null,
      createdBy: auth.currentUser?.uid,
      createdAt: new Date(),
    });
  };

  const handleOpenModal = () => {
    setIsBottomSheetModalOpen(true);
    bottomSheetModalRef.current?.present();
  };
  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.coveText}>Cove</Text>
        <View style={styles.subsubcontainer}>
          <View style={styles.imagecontainer}>
            <Pressable onPress={handleOpenModal}>
              <Image
                source={require("../../../assets/images/Icon Artwork.png")}
              />
            </Pressable>
          </View>

          <TouchableOpacity
            style={styles.screenName}
            onPress={() => router.push("../Message")}
          >
            <Image source={require("../../../assets/images/forum.png")} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        style={styles.spaceScroll}
      >
        {spaces.map((space) => (
          <TouchableOpacity
            key={space.id}
            onPress={() =>
              router.push({
                pathname: "../HomeSpaces",
                params: { spaceId: space.id },
              })
            }
            style={{ gap: 25, padding: 15, width: "100%" }}
          >
            <View style={styles.spacescontainer}>
              <Image
                resizeMode="cover"
                source={
                  space.icon
                    ? { uri: space.icon }
                    : require("../../../assets/images/Profile.svg")
                }
                style={styles.spaceIcon}
              />
              <Text style={styles.spaceText}>{space.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["50%", "80%"]}
        onDismiss={() => setIsBottomSheetModalOpen(false)}
      >
        <View style={styles.bottomSheetModalContent}>
          <Text style={styles.bottomSheetModalTitle}>Create a New Space</Text>
          <TextInput
            style={styles.input}
            placeholder="Space Name"
            value={spaceName}
            onChangeText={setSpaceName}
          />
          <TextInput
            style={styles.input}
            placeholder="Space Description"
            value={spaceDescription}
            onChangeText={setSpaceDescription}
          />
          <Pressable style={styles.button} onPress={handlePickImage}>
            <Text style={styles.buttonText}>Pick Icon</Text>
          </Pressable>
          {spaceIcon && (
            <Image source={{ uri: spaceIcon }} style={styles.previewIcon} />
          )}
          <Pressable style={styles.button} onPress={handleCreateSpace}>
            {isLoading ? (
              <ActivityIndicator color="#fafafa" />
            ) : (
              <Text style={styles.buttonText}>Create Space</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetModal>
    </View>
  );
}
const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  addPressable: {
    backgroundColor: "#800000",
    padding: "20@s",

    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  addPressableIcon: {
    width: 30,
    height: 30,
    borderRadius: "50@s",
  },
  subcontainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16@s",
    marginTop: 20,
    borderBottomWidth: 2,
  },
  subsubcontainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  imagecontainer: {
    marginRight: "16@s",
    backgroundColor: "#800000",
    padding: "16@s",
    borderRadius: "50@s",
  },
  spaceScroll: {
    flex: 1,
  },
  spacescontainer: {
    width: "100%",
    height: "50@s",
    diplay: "flex",
    flexDirection: "row",
    marginRight: "8@s",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 5,
  },
  spaceIcon: {
    width: "60@s",
    height: "60@s",

    borderColor: "#800000",
    borderRadius: "50@s",
    borderWidth: 1,
  },
  screenName: {
    marginLeft: "5@s",
    padding: "4@s",
    backgroundColor: "#800000",
    borderRadius: "50@s",
  },
  rendercontent: {
    flex: 1,
    padding: "16@s",
  },
  bottomSheetModalContent: {
    padding: "16@s",
  },
  bottomSheetModalTitle: {
    fontSize: "18@s",
    fontWeight: "bold",
    marginBottom: "8@vs",
  },
  input: {
    height: "40@vs",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: "8@vs",
    paddingLeft: "8@s",
  },
  previewIcon: {
    width: "100@s",
    height: "100@s",
    marginVertical: "8@vs",
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
  spaceText: {
    color: "#000000",
    fontSize: 20,
  },
  coveText: {
    color: "#000000",
    fontSize: 40,
  },
});

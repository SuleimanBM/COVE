import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { auth, firestore } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

type Avatar = {
  id: string;
  imageUrl: any;
};

const avatars: Avatar[] = [
  { id: "1", imageUrl: require("../../assets/images/Profile.png") },
  { id: "2", imageUrl: require("../../assets/images/Profile.png") },
  // Add more avatars as needed
];

const { height } = Dimensions.get("window");

export default function ProfilePicture() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAvatarSelect = (imageUrl: any) => {
    setSelectedImage(Image.resolveAssetSource(imageUrl).uri);
  };

  const handleSaveProfilePicture = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image or avatar.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is signed in.");
      }

      await setDoc(
        doc(firestore, "userDetails", user.uid),
        {
          profilePicture: selectedImage,
        },
        { merge: true }
      );

      router.push("./(nav)"); // Ensure this is correct for your navigation
    } catch (error) {
      Alert.alert(
        "Error",
        `Error saving profile picture: ${(error as Error).message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ top: 150 }}>
        <Text style={styles.header}>Choose profile picture</Text>

        <View style={styles.profileCircle}>
          {selectedImage ? (
            <Image
              style={styles.selectedImage}
              source={{ uri: selectedImage }}
            />
          ) : (
            <Image
              style={styles.addIcon}
              source={require("../../assets/images/BlackLogo.png")}
            />
          )}
          <TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
            <Image
              style={styles.addButtonIcon}
              source={require("../../assets/images/add plus Large.png")}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeader}>or choose a Cove avatar</Text>
        <FlatList
          data={avatars}
          keyExtractor={(item) => item.id}
          numColumns={4}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => handleAvatarSelect(item.imageUrl)}
            >
              <Image style={styles.avatarImage} source={item.imageUrl} />
            </TouchableOpacity>
          )}
        />
        <View style={{ bottom: 220, gap: 5 }}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleSaveProfilePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push("./(nav)")}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    top: 30,
    backgroundColor: "#efefef",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  addIcon: {
    width: 150,
    height: 150,
  },
  addButton: {
    height: 40,
    width: 40,
    backgroundColor: "#800000",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 160,
    bottom: 120,
  },
  addButtonIcon: {
    height: 20,
    width: 20,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  nextButton: {
    backgroundColor: "#8B0000",
    width: 320,
    height: 50,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  skipText: {
    textAlign: "center",
    color: "#8B0000",
    marginTop: 10,
  },

  skipButton: {
    width: 320,
    height: 50,
    borderColor: "#800000",
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

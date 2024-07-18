import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/app/firebaseConfig"; // Ensure the correct path to firebaseConfig
import { getAuth, User } from "firebase/auth";
import { Video, ResizeMode } from "expo-av";

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const { height } = Dimensions.get("window");

export default function ReelProfileScreen() {
  const [video, setVideo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reels, setReels] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const router = useRouter();

  const fetchUserReelsAndProfile = async () => {
    const user: User | null = auth.currentUser;
    if (!user) {
      Alert.alert("User not authenticated");
      return;
    }

    try {
      // Fetch user reels
      const q = query(
        collection(firestore, "reels"),
        where("user", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const userReels = querySnapshot.docs.map((doc) => doc.data());
      setReels(userReels);

      // Fetch user profile
      const userDocRef = doc(firestore, "userDetails", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userDetails = userDocSnap.data();

      if (userDetails?.profilePicture) {
        setProfilePicture(userDetails.profilePicture);
      }

      setUserProfile(userDetails);
    } catch (error) {
      console.error("Error fetching user reels and profile:", error);
      Alert.alert("Failed to fetch reels and profile");
    }
  };

  useEffect(() => {
    fetchUserReelsAndProfile();
  }, []);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const uploadVideo = async () => {
    const user: User | null = auth.currentUser;
    if (!user) {
      Alert.alert("User not authenticated");
      return;
    }

    if (!video) return;

    setUploading(true);
    try {
      const response = await fetch(video);
      const blob = await response.blob();

      const storageRef = ref(
        storage,
        `reels/${Date.now()}-${Math.random().toString(36).substring(7)}`
      );
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(firestore, "reels"), {
        videoUrl: downloadURL,
        user: user.uid, // Store user UID
        description: "Lorem ipsum dolor sit amet.",
        likes: "0",
        comments: "0",
        shares: "0",
        createdAt: new Date(),
      });

      console.log("Video uploaded successfully:", downloadURL);
      fetchUserReelsAndProfile();
      router.push("/Reel");
    } catch (error) {
      console.error("Error uploading video:", error);
      Alert.alert(
        "Upload Failed",
        "There was an error uploading the video. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground />
      <ScrollView
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 30,
          top: 170,
          height: 700,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <View style={styles.profileHeader}>
            {profilePicture && (
              <Image source={{ uri: profilePicture }} style={styles.avatar} />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.displayName || "Braintech Graphics"}
              </Text>
              <Text style={styles.profileHandle}>
                @braintechgh • 568.9K Followers
              </Text>
            </View>
          </View>
          <Text style={[styles.profileDescription, { marginVertical: 0 }]}>
            Description
          </Text>
          <Text style={styles.profileDescription}>
            Lorem ipsum dolor sit amet consectetur. Amet non fringilla ultricies
            et tempor arcu.
          </Text>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Reels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={pickVideo}>
            <Text style={styles.tabText}>Pick a video from camera roll</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.Container}>
            {video && (
              <>
                <Text>Selected Video:</Text>
                <Video
                  source={{ uri: video }}
                  style={styles.thumbnail}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
                {uploading ? (
                  <ActivityIndicator size="large" color="#800000" />
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={uploadVideo}
                    disabled={uploading}
                  >
                    <Text style={styles.buttonText}>Upload Video</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {reels.map((reel, index) => (
            <View key={index} style={styles.reelContainer}>
              <Video
                source={{ uri: reel.videoUrl }}
                style={styles.thumbnail}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
              <Text>{reel.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",

    top: 30,
    backgroundColor: "#FAF2F2",
  },
  Container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    padding: 5,
    height: "50%",
    marginBottom: 30,
  },
  profileHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileHandle: {
    fontSize: 14,
    color: "#888",
  },
  profileDescription: {
    fontSize: 14,
    color: "#888",
    marginVertical: 8,
    width: "80%",
    alignSelf: "center",
  },
  followButton: {
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 40,
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
    alignSelf: "center",
  },
  followButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#800000",
    padding: 10,
    borderRadius: 10,
    marginVertical: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    marginVertical: 0,
  },
  content: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    height: 400,
    width: "100%",
    flexWrap: "wrap",
    gap: 10,
  },
  reelContainer: {
    height: 200,
    width: 150,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
  },
});

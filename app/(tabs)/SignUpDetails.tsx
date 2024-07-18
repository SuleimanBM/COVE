import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, firestore } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SignUpDetailsScreen() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(firestore, "userDetails", user.uid), {
        username,
        dob,
        displayName,
        createdAt: new Date(),
      });
    } else {
      throw new Error("No user is signed in.");
    }
  };

  const handleCreateAccount = async () => {
    if (!username || !displayName || !dob) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      await createUserDetails();
      router.push("/ProfilePic"); // Ensure this is correct for your navigation
    } catch (error) {
      Alert.alert(
        "Error",
        `Error creating user details: ${(error as Error).message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={{ top: 150 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>Create an account</Text>
        </View>
        <View style={{ gap: 15 }}>
          <View>
            <Text style={{ bottom: 2, color: "#3A3A3A", fontSize: 15 }}>
              Username
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <Text style={{ top: 2, color: "#3A3A3A", fontSize: 10 }}>
              Username must be 2-32 characters
            </Text>
          </View>

          <View>
            <Text style={{ bottom: 2, color: "#3A3A3A", fontSize: 15 }}>
              Display Name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

          <View>
            <Text style={{ bottom: 2, color: "#3A3A3A", fontSize: 15 }}>
              Date of Birth
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>{dob.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.create}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: "#ffffff" }}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 30,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FAF2F2",
  },
  title: {
    fontSize: 24,
    marginBottom: 50,
  },
  input: {
    height: 50,
    width: 320,
    borderColor: "#D4D4D4",
    backgroundColor: "#D4D4D4",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  create: {
    top: 25,
    backgroundColor: "#800000",
    width: 320,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButton: {
    height: 40,
    justifyContent: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  datePickerText: {
    color: "#000",
  },
});

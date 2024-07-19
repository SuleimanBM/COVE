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
    if (!validateInputs()) {
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

  const validateInputs = () => {
    if (!username || username.length < 3 || username.length > 32) {
      Alert.alert(
        "Invalid Username",
        "Username must be between 2 and 32 characters."
      );
      return false;
    }

    if (!displayName || displayName.length < 3 || displayName.length > 32) {
      Alert.alert("Invalid Display Name", "Display Name cannot be empty.");
      return false;
    }

    const age = getAge(dob);
    if (age < 13) {
      Alert.alert(
        "Invalid Date of Birth",
        "You must be at least 13 years old to create an account."
      );
      return false;
    }

    return true;
  };

  const getAge = (birthDate : Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }

    return age;
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

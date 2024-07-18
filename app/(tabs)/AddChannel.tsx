import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { firestore } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

interface AddChannelBottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  spaceId: string;
}

const AddChannelBottomSheetModal: React.FC<AddChannelBottomSheetModalProps> = ({
  isVisible,
  onClose,
  spaceId,
}) => {
  const [channelName, setChannelName] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleAddChannel = async () => {
    setIsLoading(true);
    try {
      await addDoc(collection(firestore, `spaces/${spaceId}/channels`), {
        name: channelName,
        description: channelDescription,
        icon: null,
      });
      setChannelName("");
      setChannelDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding channel: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={isVisible ? 1 : -1}
      snapPoints={snapPoints}
      onDismiss={onClose}
    >
      <View style={styles.bottomSheetModal}>
        <Text style={styles.title}>Add Channel</Text>
        <TextInput
          style={styles.input}
          placeholder="Channel Name"
          value={channelName}
          onChangeText={setChannelName}
        />
        <TextInput
          style={styles.input}
          placeholder="Channel Description"
          value={channelDescription}
          onChangeText={setChannelDescription}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddChannel}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Channel</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetModal: {
    backgroundColor: "white",
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#800000",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AddChannelBottomSheetModal;

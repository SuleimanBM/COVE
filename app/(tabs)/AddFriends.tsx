import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../firebaseConfig";

type AddFriendBottomSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  spaceId: string;
};

const AddFriendBottomSheet: React.FC<AddFriendBottomSheetProps> = ({
  isVisible,
  onClose,
  spaceId,
}) => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const snapPoints = useMemo(() => [ "75%","90%"], []);

  useEffect(() => {
    if (!searchText) return;

    const fetchUsers = async () => {
      const q = query(
        collection(firestore, "userDetails"),
        where("displayName", ">=", searchText),
        where("displayName", "<=", searchText + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, [searchText]);

  const handleAddFriend = async (userId: string) => {
    const spaceDocRef = doc(firestore, `spaces/${spaceId}`);
    const spaceDoc = await getDoc(spaceDocRef);
    if (spaceDoc.exists()) {
      const spaceData = spaceDoc.data();
      if (!spaceData.members.includes(userId)) {
        await updateDoc(spaceDocRef, {
          members: [...spaceData.members, userId],
        });
        onClose();
      }
    }
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <Text>{item.displayName}</Text>
      <TouchableOpacity onPress={() => handleAddFriend(item.id)}>
        <Text style={styles.addButton}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BottomSheet
      index={isVisible ? 1 : -1}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
    >
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a friend"
          value={searchText}
          onChangeText={setSearchText}
        />
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  addButton: {
    color: "#800000",
  },
});

export default AddFriendBottomSheet;

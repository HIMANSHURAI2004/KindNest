
import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, ScrollView 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { database as db } from "../../config/FirebaseConfig";
import AntDesign from '@expo/vector-icons/AntDesign';

type WishlistItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  requester: string;
};

const Wishlist = () => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("Food");
  const [description, setDescription] = useState<string>("");
  const [requester, setRequester] = useState<string>("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      const wishlistData: WishlistItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<WishlistItem, "id">), 
      }));
      setWishlist(wishlistData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!name || !description || !requester) {
      Alert.alert("Error", "Please enter all required fields.");
      return;
    }

    setLoading(true);
    try {
      const wishlistData = { name, category, description, requester };

      if (editingId) {
        const wishlistRef = doc(db, "wishlist", editingId);
        await updateDoc(wishlistRef, wishlistData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "wishlist"), wishlistData);
      }

      setName("");
      setCategory("Food");
      setDescription("");
      setRequester("");
    } catch (error) {
      Alert.alert("Error", "Failed to process wishlist request.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setDescription(item.description);
    setRequester(item.requester);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "wishlist", id));
  };

  return (
    <ScrollView className="p-6 bg-white h-full">
      <View className="my-6">
        <Text className="text-2xl font-bold text-teal-700">Wishlist Requests</Text>
        <Text className="text-md text-gray-600 mt-2">
          Request specific needs for old age homes, orphanages, and NGOs.
        </Text>
      </View>

      <Text className="text-lg font-semibold text-gray-800 mb-2">Requester Name</Text>
      <TextInput
        placeholder="Enter your name or organization"
        value={requester}
        onChangeText={setRequester}
        className="border border-gray-300 p-3 rounded-lg mb-4"
      />

      <Text className="text-lg font-semibold text-gray-800 mb-2">Category</Text>
      <View className="border border-gray-300 rounded-lg">
        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Food" value="Food" />
          <Picker.Item label="Clothes" value="Clothes" />
          <Picker.Item label="Toys" value="Toys" />
          <Picker.Item label="Medical Supplies" value="Medical Supplies" />
          <Picker.Item label="Miscellaneous" value="Miscellaneous" />
        </Picker>
      </View>

      <Text className="text-lg font-semibold text-gray-800 mt-4">Requested Item</Text>
      <TextInput
        placeholder="Enter the item you need"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 p-3 rounded-lg mt-2"
      />

      <Text className="text-lg font-semibold text-gray-800 mt-4">Description</Text>
      <TextInput
        placeholder="Describe the need in detail"
        value={description}
        onChangeText={setDescription}
        multiline
        className="border border-gray-300 p-3 rounded-lg mt-2 h-24"
      />

      <TouchableOpacity 
        className="bg-teal-700 p-4 rounded-full shadow-lg mt-6"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {editingId ? "Update Request" : "Submit Request"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="blue" className="mt-4" />}

      <Text className="text-xl font-semibold text-gray-800 mt-8 mb-4">Existing Requests</Text>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl shadow-md mb-3 flex-row justify-between">
            <View>
              <Text className="text-md font-medium">{item.category} Request</Text>
              <Text className="text-sm text-gray-500">
                {item.requester} - {item.name}
              </Text>
              <Text className="text-sm text-gray-400">{item.description}</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => handleEdit(item)} className="mr-4">
                <AntDesign name="edit" size={22} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <AntDesign name="delete" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default Wishlist;

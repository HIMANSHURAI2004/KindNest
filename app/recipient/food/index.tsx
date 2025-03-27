"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { ArrowLeft, Plus, Minus } from "react-native-feather";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { database } from "../../../config/FirebaseConfig";

const THEME = {
  primary: "#1f6969",
  primaryLight: "#2a8a8a",
  primaryDark: "#184f4f",
  secondary: "#f8b400",
  accent: "#ff6b6b",
  background: "#f7f9fc",
  card: "#ffffff",
  text: "#333333",
  textLight: "#ffffff",
  textMuted: "#7c8a97",
};

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate?: string;
  type: string;
  image: string;
  location?: { lat: number; lng: number };
}

export default function RecipientFood() {
  const router = useRouter();
  const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
  const [requestedItems, setRequestedItems] = useState<{ [key: string]: number }>({});
  const [numPeople, setNumPeople] = useState(""); 
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchAvailableFood = async () => {
      try {
        const querySnapshot = await getDocs(collection(database, "Food Donations"));
        const items: FoodItem[] = [];

        querySnapshot.forEach((doc) => {
          const foodData = doc.data();
          if (foodData.items) {
            foodData.items.forEach((item: any) => {
              const existingItem = items.find((i) => i.id === item.id);
              if (existingItem) {
                existingItem.quantity += item.quantity;
              } else {
                items.push({
                  id: item.id,
                  name: item.name,
                  type: item.type || "General",
                  quantity: item.quantity,
                  expiryDate: item.expiryDate || "N/A",
                  image: item.image,
                  location: foodData.location || null,
                });
              }
            });
          }
        });

        setAvailableFood(items);
      } catch (error) {
        console.error("Error fetching food donations:", error);
      }
    };

    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location access is needed to find nearby donations.");
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchAvailableFood();
    fetchLocation();
  }, []);

  const handleRequestChange = (itemId: string, change: number) => {
    setRequestedItems((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change),
    }));
  };

  const handleRequest = async () => {
    if (!Object.values(requestedItems).some((quantity) => quantity > 0)) {
      Alert.alert("No items selected", "Please select at least one food item to request.");
      return;
    }

    Alert.alert("Confirm Request", "You are about to request food. Proceed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            const requestData = {
              items: Object.entries(requestedItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([id, quantity]) => {
                  const item = availableFood.find((food) => food.id === id);
                  return item ? { id, name: item.name, quantity } : null;
                })
                .filter(Boolean),
              numPeople: numPeople || "Not specified",
              timestamp: new Date().toISOString(),
              status: "Pending",
            };

            await addDoc(collection(database, "Food Requests"), requestData);
            Alert.alert("Request Sent!", "Your food request has been recorded.");
            setRequestedItems({});
            setNumPeople("");
          } catch (error) {
            console.error("Error sending request:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/recipient")}>
          <ArrowLeft width={24} height={24} color={THEME.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Request Food</Text>
          <Text style={styles.headerSubtitle}>Select items to request</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Food Donations</Text>

          <View style={styles.foodItemsContainer}>
            {availableFood.map((item) => (
              <View key={item.id} style={styles.foodItemCard}>
                <Image source={{ uri: item.image }} style={styles.foodItemImage} contentFit="contain" />
                <View style={styles.foodItemDetails}>
                  <Text style={styles.foodItemName}>{item.name}</Text>
                  <Text style={styles.foodItemInfo}>Type: {item.type}</Text>
                  <Text style={styles.foodItemInfo}>Expiry: {item.expiryDate}</Text>
                  <Text style={styles.foodItemQuantity}>Available: {item.quantity} units</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[styles.quantityButton, requestedItems[item.id] === 0 && styles.quantityButtonDisabled]}
                    onPress={() => handleRequestChange(item.id, -1)}
                    disabled={requestedItems[item.id] === 0}
                  >
                    <Minus width={16} height={16} color={THEME.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{requestedItems[item.id] || 0}</Text>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => handleRequestChange(item.id, 1)}>
                    <Plus width={16} height={16} color={THEME.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Number of People</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter number of people to be served"
            value={numPeople}
            onChangeText={setNumPeople}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.checkoutButton} onPress={handleRequest}>
        <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.checkoutButtonGradient}>
          <Text style={styles.checkoutButtonText}>Request Food</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight, padding: 20, flexDirection: "row", alignItems: "center" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 16 }, // Added scrollContent style
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 20 },
  foodItemsContainer: { marginTop: 10 },
  sectionContainer: { margin: 16, padding: 16, backgroundColor: THEME.card, borderRadius: 8 },
  headerContent: { marginLeft: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: THEME.textLight },
  headerSubtitle: { fontSize: 12, color: "rgba(255, 255, 255, 0.8)" },
  foodItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.card, padding: 12, borderRadius: 16, marginBottom: 10 },
  foodItemImage: { width: 50, height: 50, marginRight: 12 },
  foodItemDetails: { flex: 1 },
  foodItemName: { fontSize: 14, fontWeight: "bold", color: THEME.text },
  foodItemQuantity: { fontSize: 12, color: THEME.textMuted },
  foodItemInfo: { fontSize: 12, color: THEME.textMuted }, // Added style for foodItemInfo
  quantityControl: { flexDirection: "row", alignItems: "center" },
  quantityButton: { width: 32, height: 32, justifyContent: "center", alignItems: "center", borderRadius: 16, backgroundColor: THEME.card },
  checkoutButton: { padding: 16, alignItems: "center", backgroundColor: THEME.primary, borderRadius: 16 },
  checkoutButtonText: { fontSize: 15, color: THEME.textLight, fontWeight: "bold" },
  checkoutButtonGradient: { borderRadius: 16, padding: 16, alignItems: "center" },
  quantityText: { fontSize: 14, fontWeight: "bold", color: THEME.text },
  checkoutContainer: { padding: 16, backgroundColor: THEME.card, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: THEME.text, marginBottom: 10 },
  quantityButtonDisabled: { backgroundColor: THEME.textMuted },
  input: {
    height: 40,
    borderColor: THEME.textMuted,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: THEME.card,
    color: THEME.text,
  },
});
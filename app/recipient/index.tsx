import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, FlatList, Platform 
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { database as db } from "../../config/FirebaseConfig"; // Ensure correct Firebase setup
import { Timestamp } from "firebase/firestore";

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

type Donation = {
  id: string;
  donorName: string;
  amount: number;
  timestamp: Timestamp;
};

const categories = [
  { id: "food", title: "Food", icon: "https://cdn-icons-png.flaticon.com/128/706/706195.png", description: "Provide healthy meals and fight hunger.", gradientColors: ["#1f6969", "#2a8a8a"] },
  { id: "clothes", title: "Clothes", icon: "https://cdn-icons-png.flaticon.com/128/2954/2954918.png", description: "Donate clothes to bring warmth.", gradientColors: ["#1f6969", "#2a8a8a"] },
  { id: "money", title: "Money", icon: "https://cdn-icons-png.flaticon.com/128/625/625599.png", description: "Support impactful causes.", gradientColors: ["#1f6969", "#2a8a8a"] },
  { id: "other", title: "Other", icon: "https://cdn-icons-png.flaticon.com/512/3208/3208615.png", description: "Every act of kindness matters.", gradientColors: ["#1f6969", "#2a8a8a"] },
];

export default function HomeScreen() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [role, setRole] = useState<"Recipient" | "Donor">("Recipient");

  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationList: Donation[] = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        donorName: doc.data().donorName as string,
        amount: doc.data().amount as number,
        timestamp: doc.data().timestamp as Timestamp,
      }));
      setDonations(donationList);

      // Calculate total donation amount
      const total = donationList.reduce((sum, donation) => sum + donation.amount, 0);
      setTotalDonations(total);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    console.log(`Selected category: ${categoryId}`);
  };

  const handleRoleSelection = () => {
    setRole(role === "Recipient" ? "Donor" : "Recipient");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.navButton}>
          <Text style={styles.navButtonText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRoleSelection} style={styles.navButton}>
          <Text style={styles.navButtonText}>🔄 Switch to {role === "Recipient" ? "Donor" : "Recipient"}</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/11038/11038496.png" }} style={styles.categoryIcon} contentFit="contain" />
          <Text style={styles.appName}>Welcome {role}</Text>
        </View>
        <Text style={styles.tagline}>Join us in spreading kindness.</Text>
      </View>

      {/* Total Donations */}
      <View style={styles.totalDonationsContainer}>
        <Text style={styles.totalDonationsText}>Total Donations: ₹{totalDonations}</Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryCardWrapper} onPress={() => handleCategoryPress(category.id)}>
            <LinearGradient colors={category.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryCard}>
              <Image source={{ uri: category.icon }} style={styles.categoryIcon} contentFit="contain" />
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Donations */}
      <View style={styles.donationsContainer}>
        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <FlatList
          data={donations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.donationItem}>
              <Text style={styles.donationText}>{item.donorName} donated ₹{item.amount}</Text>
              <Text style={styles.donationTimestamp}>{new Date(item.timestamp.toDate()).toLocaleString()}</Text>
            </View>
          )}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <BlurView intensity={80} tint="light" style={styles.footerBlur}>
          <Text style={styles.footerText}>Your generosity makes a difference!</Text>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  navbar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: THEME.primary },
  navButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: THEME.primaryLight, borderRadius: 8 },
  navButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  header: { padding: 24 },
  appName: { fontSize: 22, color: THEME.primary, fontWeight: "bold" },
  tagline: { fontSize: 14, color: THEME.textMuted },
  totalDonationsContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  totalDonationsText: { fontSize: 16, fontWeight: "bold", color: THEME.primary },
  donationsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  donationItem: { paddingVertical: 8 },
  donationText: { fontSize: 14, fontWeight: "bold" },
  donationTimestamp: { fontSize: 12, color: THEME.textMuted },
  footer: { paddingHorizontal: 20, paddingBottom: 10 },
  footerBlur: { borderRadius: 30, padding: 16, alignItems: "center" },
  footerText: { fontSize: 12, color: THEME.textMuted },
});


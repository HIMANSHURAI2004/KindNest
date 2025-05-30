import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { setLocalStorage, getLocalStorage } from "@/service/Storage";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { database } from "@/config/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const THEME = {
  primary: "#1f6969",
  primaryLight: "#2a8a8a",
  background: "#f0f5f9",
  textLight: "#ffffff",
  textDark: "#1f1f1f",
  cardBackground: "#ffffff",
  shadowColor: "#000000",
};

export default function CategorySelection() {
  
  const router = useRouter();

  const selectRole = async (role: "donor" | "recipient") => {
    const storedUser = await getLocalStorage("userDetail");
    if (!storedUser || !storedUser.uid) return;

    const userId = storedUser.uid;
    if (!userId) return;

    const userRef = doc(database, "users", userId);
    await updateDoc(userRef, { category: role });

    await setLocalStorage("category", role);
    router.replace(role === "donor" ? "/" : "/");
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B5351" />
      <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} contentFit="contain" />
      <Text style={styles.heading}>Choose Your Role</Text>
      <Text style={styles.subHeading}>Help us understand how you want to contribute.</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.card} onPress={() => selectRole("donor")}>
          <View style={styles.categoryIconContainer}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/756/756742.png" }} style={styles.othersItemImage} contentFit="contain" />
          </View>
          <Text style={styles.cardText}>I am a Donor</Text>
          <Text style={styles.cardSubText}>Donate resources & support causes.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => selectRole("recipient")}>
        <View style={styles.categoryIconContainer}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/6384/6384846.png" }} style={styles.othersItemImage} contentFit="contain" />
          </View>
          <Text style={styles.cardText}>I am a Recipient</Text>
          <Text style={styles.cardSubText}>Receive donations & assistance.</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B5351",
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 24,
    color: THEME.textLight,
    fontFamily: "poppins-bold",
  },
  subHeading: {
    fontSize: 14,
    color: THEME.textDark,
    marginBottom: 20,
    fontFamily: "poppins-medium",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
  },
  card: {
    backgroundColor: THEME.background,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: THEME.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    fontSize: 16,
    fontFamily : "poppins-bold",
    color: THEME.textDark,
    marginTop: 10,
  },
  cardSubText: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 4,
    textAlign: "center",
    fontFamily : "poppins-medium",
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 105, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  othersItemImage: {
    width: 50,
    height: 50,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
});


import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Platform } from "react-native"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import { ArrowLeft } from "react-native-feather"
import { getLocalStorage } from "@/service/Storage"

const { width, height } = Dimensions.get("window")

const THEME = {
  primary: "#0B5351" ,
  primaryLight: "#2a8a8a",
  primaryDark: "#184f4f",
  secondary: "#f8b400",
  accent: "#ff6b6b",
  background: "#f7f9fc",
  card: "#ffffff",
  text: "#333333",
  textLight: "#ffffff",
  textMuted: "#7c8a97",
}

const categories = [
  {
    id: "food",
    title: "Food",
    icon: "https://hips.hearstapps.com/hmg-prod/images/food-bank-donations-1670258739.jpg",
    description: "Provide healthy meals and fight hunger in communities.",
    gradientColors: ["#1f6969", "#2a8a8a"],
  },
  {
    id: "clothes",
    title: "Clothes",
    icon: "https://t4.ftcdn.net/jpg/03/07/44/67/360_F_307446785_ANJdwWGpWT1EC7Adl3Y8ukdANFT8M0RN.jpg",
    description: "Donate clothes to bring warmth, comfort, and dignity.",
    gradientColors: ["#1f6969", "#2a8a8a"],
  },
  {
    id: "money",
    title: "Money",
    icon: "https://img.freepik.com/premium-photo/charity-finances-funding-investment-people-concept-man-putting-euro-money-into-donation-box_380164-151490.jpg",
    description: "Support impactful causes and help transform lives.",
    gradientColors: ["#1f6969", "#2a8a8a"],
  },
  {
    id: "other",
    title: "Other",
    icon: "https://img.freepik.com/premium-photo/box-full-used-toys-cloths-books-stationery-donation_49149-816.jpg",
    description: "Give in any way—every act of kindness matters.",
    gradientColors: ["#1f6969", "#2a8a8a"],
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const handleCategoryPress = (categoryId:string) => {
    router.replace(`donor/${categoryId}`)
    // console.log(`Selected category: ${categoryId}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
            <ArrowLeft width={20} height={20} color={THEME.textLight} />
        </TouchableOpacity>
        <TouchableOpacity  style={styles.navButton} onPress={() => router.replace('/donor/donationHistory')}>
        <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/2822/2822687.png" }} style= {{height:20 , width:20}} contentFit="contain" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/11038/11038496.png" }} style={styles.titleIcon} contentFit="contain" />
          </View>
          <Text style={styles.appName}>Welcome to KindNest</Text>
        </View>
        <Text style={styles.tagline}>Join us in spreading kindness to those in need.</Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.9}
            style={styles.categoryCardWrapper}
            onPress={() => handleCategoryPress(category.id)}
          >
            <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryCard}>
              <View style={styles.iconContainer}>
                <Image source={{ uri: category.icon }} style={styles.categoryIcon}  />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <BlurView intensity={80} tint="light" style={styles.footerBlur}>
          <Text style={styles.footerText}>Your generosity can brighten someone's world</Text>
        </BlurView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    alignItems: "center",
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: THEME.primaryLight,
    borderRadius: 8,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "poppins-medium",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 22,
    color: THEME.primary,
    marginLeft: 2,
    fontFamily: "poppins-bold",
  },
  tagline: {
    fontSize: 14,
    color: THEME.textMuted,
    marginLeft: 2,
  },
  categoriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  categoryCardWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  titleIcon: {
    width: 40,
    height: 40,
  },
  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 8,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    color: THEME.textLight,
    marginBottom: 6,
    fontFamily: "poppins-medium",
  },
  categoryDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "poppins",
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  footerBlur: {
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontFamily: "poppins",
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
})

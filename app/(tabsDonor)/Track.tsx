"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import * as Location from "expo-location"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { MapPin, Home, Users, Briefcase, ChevronRight, Navigation } from "react-native-feather"

const { width, height } = Dimensions.get("window")

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
}

// Location card data
const locationCards = [
  {
    id: "oldagehome",
    title: "Old Age Homes",
    description: "Find nearby elderly care centers to donate",
    icon: Home,
    image: "https://img.freepik.com/premium-photo/group-senior-friends-sitting-watching-tv-together_53876-47428.jpg?ga=GA1.1.776244776.1726317227&semt=ais_hybrid",
    searchQuery: "Old Age Home",
    gradientColors: ["#0B5351", "#092327"],
  },
  {
    id: "orphanage",
    title: "Orphanages",
    description: "Locate children's homes that need your support",
    icon: Users,
    image: "https://img.freepik.com/premium-photo/070722-irpin-ukraine-evacuation-children-russian-war-against-ukraine-family-is-hiding-dungeon-from-air-strikes_632557-2287.jpg?ga=GA1.1.776244776.1726317227&semt=ais_hybrid",
    searchQuery: "Orphanage",
    gradientColors: ["#0B5351", "#092327"],
  },
  {
    id: "ngo",
    title: "NGOs",
    description: "Connect with organization making a difference",
    icon: Briefcase,
    image: "https://img.freepik.com/premium-photo/woman-clipboard-volunteering-group-helping-kindness-ngo-charity-project-with-community-park-distribution-food-parcel-grocery-boxes-donation-teamwork-care-with-checklist_590464-384242.jpg?ga=GA1.1.776244776.1726317227&semt=ais_hybrid",
    searchQuery: "NGO",
    gradientColors: ["#0B5351", "#092327"],
  },
]

const TrackScreen = () => {
  const router = useRouter()
  const [loadingLocation, setLoadingLocation] = useState<string | null>(null)

  // Function to open Google Maps with a search query
  const openGoogleMaps = async (query: string, cardId: string) => {
    setLoadingLocation(cardId)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access location was denied")
        setLoadingLocation(null)
        return
      }

      const userLocation = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = userLocation.coords

      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`
      router.push(googleMapsUrl as any)
    } catch (error) {
      alert("Error accessing location. Please try again.")
    } finally {
      setLoadingLocation(null)
    }
  }

  return (
    <View style={styles.container}>
        <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {/* <MapPin width={28} height={28} color={THEME.textLight} /> */}
              <Text style={styles.headerTitle}>Find Nearby</Text>
            </View>
            <Text style={styles.headerSubtitle}>Locate places where you can contribute to kindness</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.cardsContainer}>
            {locationCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => openGoogleMaps(card.searchQuery, card.id)}
              >
                <LinearGradient
                  colors={card.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardTextContent}>
                      <View style={styles.iconContainer}>
                        <card.icon width={24} height={24} color={THEME.textLight} />
                      </View>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardDescription}>{card.description}</Text>

                      <View style={styles.findNearbyButton}>
                        {loadingLocation === card.id ? (
                          <ActivityIndicator size="small" color={THEME.textLight} />
                        ) : (
                          <>
                            <Navigation width={16} height={16} color={THEME.textLight} />
                            <Text style={styles.findNearbyText}>Find Nearby</Text>
                            <ChevronRight width={16} height={16} color={THEME.textLight} />
                          </>
                        )}
                      </View>
                    </View>

                    <View style={styles.cardImageContainer}>
                      <Image source={{ uri: card.image }} style={styles.cardImage} contentFit="cover" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    
  },
  backgroundImage: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 20 : 15,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop:20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textLight,
    marginLeft: 14,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 85,
  },
  cardsContainer: {
    marginTop: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 200,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
  },
  cardTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    lineHeight: 20,
  },
  findNearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  findNearbyText: {
    color: THEME.textLight,
    fontWeight: "600",
    fontSize: 14,
    marginHorizontal: 6,
  },
  cardImageContainer: {
    width: width * 0.35,
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 16,
  },
  cardImage: {
    flex: 1,
    borderRadius: 12,
  },
  backButton: {
    marginTop: 30,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
  },
})

export default TrackScreen


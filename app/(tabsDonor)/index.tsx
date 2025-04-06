"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronRight } from "react-native-feather"
import { useRouter } from "expo-router"
import { getLocalStorage } from "@/service/Storage"
import { database } from "@/config/FirebaseConfig"
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, getDoc } from "firebase/firestore"

const { width, height } = Dimensions.get("window")

// Theme colors
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
  food: "#FF9800",
  clothes: "#2196F3",
  money: "#4CAF50",
  other: "#9C27B0",
}

// Featured campaigns with images
const featuredCampaigns = [
  {
    id: "1",
    title: "Winter Clothing Drive",
    image: "https://img.freepik.com/premium-photo/crop-close-up-female-put-gather-clothes-box-make-donation-needy-people_1235831-280202.jpg",
    description: "Help provide warm clothes to those in need this winter season",
    progress: 75,
    gradient: ["#0B5351", "#092327"],
  },
  {
    id: "2",
    title: "Food for All",
    image: "https://kj1bcdn.b-cdn.net/media/74822/food.jpg",
    description: "Support our mission to provide nutritious meals to underprivileged communities",
    progress: 60,
    gradient: ["#0B5351", "#092327"],
  },
  {
    id: "3",
    title: "Education Support",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr6ga0q1dMvRpzfcXM8SgdGKmHb6PvP1Akdw&s",
    description: "Donate books and stationery to help children continue their education",
    progress: 45,
    gradient: ["#0B5351", "#092327"],
  },
]

// Impact statistics with images
const impactStats = [
  {
    id: "1",
    title: "Donations",
    value: "0",
    image: "https://img.freepik.com/free-photo/volunteer-giving-box-with-donations-another-volunteer_23-2149230558.jpg?semt=ais_hybrid&w=740",
    gradient: ["#4CAF50", "#81C784"],
  },
  {
    id: "2",
    title: "Lives Impacted",
    value: "0",
    image: "https://img.freepik.com/free-photo/volunteers-collecting-food-donations-medium-shot_23-2149182021.jpg",
    gradient: ["#2196F3", "#64B5F6"],
  },
  {
    id: "3",
    title: "Communities",
    value: "0",
    image: "https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvMzA4LW5hbWU3MDY1LWpqLmpwZw.jpg",
    gradient: ["#FF9800", "#FFB74D"],
  },
]

// Testimonials
const testimonials = [
  {
    id: "1",
    quote: "We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
    role: "Former Prime Minister of the United Kingdom",
  },
  {
    id: "2",
    quote: "Giving is not just about making a donation. It's about making a difference.",
    author: "Kathy Calvin",
    role: "Former President and CEO of the UN Foundation",
  },
  {
    id: "3",
    quote: "We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
    role: "Former Prime Minister of the United Kingdom",
  },
]

// Category images mapping
const categoryImages = {
  Food: "https://hips.hearstapps.com/hmg-prod/images/food-bank-donations-1670258739.jpg",
  Clothing: "https://t4.ftcdn.net/jpg/03/07/44/67/360_F_307446785_ANJdwWGpWT1EC7Adl3Y8ukdANFT8M0RN.jpg",
  Monetary: "https://img.freepik.com/premium-photo/charity-finances-funding-investment-people-concept-man-putting-euro-money-into-donation-box_380164-151490.jpg",
  Other: "https://img.freepik.com/premium-photo/box-full-used-toys-cloths-books-stationery-donation_49149-816.jpg",
  Books: "https://img.freepik.com/premium-photo/box-full-used-toys-cloths-books-stationery-donation_49149-816.jpg",
  Medical: "https://img.freepik.com/premium-photo/box-full-used-toys-cloths-books-stationery-donation_49149-816.jpg",
  Default: "https://img.freepik.com/premium-photo/box-full-used-toys-cloths-books-stationery-donation_49149-816.jpg",
}

// Format date for display
const formatDate = (timestamp: Timestamp | string) => {
  let date

  // If it's a Firestore Timestamp object, convert to Date
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate()
  }
  // If it's a string, convert it directly
  else if (typeof timestamp === "string") {
    date = new Date(timestamp)
  } else {
    return "Invalid Date"
  }

  // Calculate time difference
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 30) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } else if (diffDays > 0) {
    return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`
  } else {
    return "Just now"
  }
}

// Cache for donor/recipient information to avoid repeated fetches
const userCache: Record<string, any> = {}

// Fetch user information from users collection
const fetchUserInfo = async (userId: string): Promise<any | null> => {
  if (!userId) return null

  // Check cache first
  if (userCache[userId]) {
    return userCache[userId]
  }

  try {
    const userRef = doc(database, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      const userInfo = {
        id: userId,
        name: userData.name || userData.displayName || "Anonymous User",
        email: userData.email,
        phone: userData.phone,
        organizationName: userData.organizationDetails?.name || "",
        organizationType: userData.organizationDetails?.type || "",
      }

      // Cache the result
      userCache[userId] = userInfo
      return userInfo
    }

    return null
  } catch (error) {
    console.error("Error fetching user info:", error)
    return null
  }
}

// Get category image
const getCategoryImage = (category: string) => {
  const normalizedCategory = category?.toLowerCase() || ""

  if (normalizedCategory.includes("food")) return categoryImages.Food
  if (normalizedCategory.includes("cloth")) return categoryImages.Clothing
  if (normalizedCategory.includes("money") || normalizedCategory.includes("monetary")) return categoryImages.Monetary
  if (normalizedCategory.includes("book")) return categoryImages.Books
  if (normalizedCategory.includes("medical")) return categoryImages.Medical
  if (normalizedCategory.includes("other")) return categoryImages.Other

  return categoryImages.Default
}

export default function HomeScreen() {
  const router = useRouter()
  const [userType, setUserType] = useState("")
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)

  // Donations state
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [receivedDonations, setReceivedDonations] = useState<any[]>([])
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    totalReceived: 0,
    totalImpact: 0,
    communities: 0,
  })

  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current
  const testimonialScrollX = useRef(new Animated.Value(0)).current
  const impactAnimations = useRef(impactStats.map(() => new Animated.Value(0))).current

  // Refs for auto-scrolling
  const featuredRef = useRef(null)
  const testimonialsRef = useRef(null)

  // Current indices for auto-scrolling
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => {
    // Fetch user data and donations
    const fetchData = async () => {
      try {
        setLoading(true)

        // Get user details from local storage
        const userDetail = await getLocalStorage("userDetail")
        const userCategory = await getLocalStorage("category")

        if (userDetail) {
          setUserName(userDetail.displayName || "")
          setUserId(userDetail.uid || "")
        }

        if (userCategory) {
          setUserType(userCategory)
        }

        // Fetch donations based on user type
        if (userDetail?.uid) {
          if (userCategory === "donor") {
            await fetchDonorData(userDetail.uid)
          } else if (userCategory === "recipient") {
            await fetchRecipientData(userDetail.uid)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Animate impact stats
    const animateImpactStats = () => {
      const animations = impactAnimations.map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      })

      Animated.stagger(200, animations).start()
    }

    animateImpactStats()
  }, [])

  // Set up auto-scrolling for featured campaigns and testimonials
  useEffect(() => {
    const featuredInterval = setInterval(() => {
      if (featuredRef.current) {
        const nextIndex = (featuredIndex + 1) % featuredCampaigns.length
        featuredRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setFeaturedIndex(nextIndex)
      }
    }, 5000)

    const testimonialsInterval = setInterval(() => {
      if (testimonialsRef.current) {
        const nextIndex = (testimonialIndex + 1) % testimonials.length
        testimonialsRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setTestimonialIndex(nextIndex)
      }
    }, 8000)

    // Clean up intervals
    return () => {
      clearInterval(featuredInterval)
      clearInterval(testimonialsInterval)
    }
  }, [featuredIndex, testimonialIndex])

  // Fetch donor's donations
  const fetchDonorData = async (donorId: string) => {
    try {
      const collections = ["Food Donations", "Clothing Donations", "Monetary Donations", "Other donations"]
      let allDonations: any[] = []
      let totalDonations = 0
      const uniqueRecipients = new Set()

      // Fetch donations from each collection
      for (const collectionName of collections) {
        const donationsRef = collection(database, collectionName)
        const q = query(donationsRef, where("donorId", "==", donorId), limit(10))

        const snapshot = await getDocs(q)

        const donations = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()

            // Add recipient to unique set
            if (data.recipientId) {
              uniqueRecipients.add(data.recipientId)
            }

            // Get recipient info
            let recipientInfo = null
            if (data.recipientId) {
              recipientInfo = await fetchUserInfo(data.recipientId)
            }

            // Normalize category name based on collection
            let categoryName = ""
            if (collectionName === "Food Donations") {
              categoryName = "Food"
            } else if (collectionName === "Clothing Donations") {
              categoryName = "Clothing"
            } else if (collectionName === "Other donations") {
              categoryName = "Other"
            } else if (collectionName === "Monetary Donations") {
              categoryName = "Monetary"
            }

            return {
              id: doc.id,
              type: categoryName,
              collectionName,
              recipientName: recipientInfo?.organizationName || data.recipientName || "Unknown Recipient",
              recipientType: recipientInfo?.organizationType || data.recipientType || "",
              ...data,
            }
          }),
        )

        allDonations = [...allDonations, ...donations]
        totalDonations += snapshot.size
      }

      // Sort by timestamp (descending)
      allDonations.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || new Date(a.timestamp).getTime() || 0
        const timeB = b.timestamp?.toMillis?.() || new Date(b.timestamp).getTime() || 0
        return timeB - timeA
      })

      setRecentDonations(allDonations)

      // Update stats
      setDonationStats({
        totalDonations,
        totalReceived: 0,
        totalImpact: Math.floor(totalDonations * 4.5), // Estimate impact (each donation helps ~4-5 people)
        communities: uniqueRecipients.size,
      })

      // Update impact stats values
      impactStats[0].value = totalDonations.toString()
      impactStats[1].value = Math.floor(totalDonations * 4.5).toString()
      impactStats[2].value = uniqueRecipients.size.toString()
    } catch (error) {
      console.error("Error fetching donor data:", error)
    }
  }

  // Fetch recipient's received donations
  const fetchRecipientData = async (recipientId: string) => {
    try {
      const collections = ["Food Donations", "Clothing Donations", "Monetary Donations", "Other donations"]
      let allDonations: any[] = []
      let totalReceived = 0
      const uniqueDonors = new Set()

      // Fetch donations from each collection
      for (const collectionName of collections) {
        const donationsRef = collection(database, collectionName)
        const q = query(donationsRef, where("recipientId", "==", recipientId), orderBy("timestamp", "desc"), limit(10))

        const snapshot = await getDocs(q)

        const donations = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()

            // Add donor to unique set
            if (data.donorId) {
              uniqueDonors.add(data.donorId)
            }

            // Get donor info
            let donorInfo = null
            if (data.donorId) {
              donorInfo = await fetchUserInfo(data.donorId)
            }

            // Normalize category name based on collection
            let categoryName = ""
            if (collectionName === "Food Donations") {
              categoryName = "Food"
            } else if (collectionName === "Clothing Donations") {
              categoryName = "Clothing"
            } else if (collectionName === "Other donations") {
              categoryName = "Other"
            } else if (collectionName === "Monetary Donations") {
              categoryName = "Monetary"
            }

            return {
              id: doc.id,
              type: categoryName,
              collectionName,
              donorName: donorInfo?.name || "Anonymous Donor",
              ...data,
            }
          }),
        )

        allDonations = [...allDonations, ...donations]
        totalReceived += snapshot.size
      }

      // Sort by timestamp (descending)
      allDonations.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || new Date(a.timestamp).getTime() || 0
        const timeB = b.timestamp?.toMillis?.() || new Date(b.timestamp).getTime() || 0
        return timeB - timeA
      })

      setReceivedDonations(allDonations)

      // Update stats
      setDonationStats({
        totalDonations: 0,
        totalReceived,
        totalImpact: Math.floor(totalReceived * 4.5), // Estimate impact
        communities: uniqueDonors.size,
      })

      // Update impact stats values
      impactStats[0].value = totalReceived.toString()
      impactStats[1].value = Math.floor(totalReceived * 4.5).toString()
      impactStats[2].value = uniqueDonors.size.toString()
    } catch (error) {
      console.error("Error fetching recipient data:", error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const renderFeaturedItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.featuredItemContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient colors={["#4b6cb7", "#182848"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredItem}>
          <View style={styles.featuredImageContainer}>
            <Image source={{ uri: item.image }} style={styles.featuredImage}  />
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderImpactStat = ({ item, index }) => {
    const translateY = impactAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    })

    const opacity = impactAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })

    return (
      <Animated.View style={[styles.statCardContainer, { opacity, transform: [{ translateY }] }]}>
        <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Image source={{ uri: item.image }} style={styles.statIcon} />
          </View>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statTitle}>{item.title}</Text>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderShortcut = ({ image, title, onPress, gradient }) => (
    <TouchableOpacity style={styles.shortcutButtonContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Image source={{ uri: image }} style={styles.shortcutIcon} contentFit="contain" />
        </View>
        <Text style={styles.shortcutTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )

  const renderDonationItem = ({ item }) => {
    // Get category image
    const categoryImage = getCategoryImage(item.type || item.category || "Default")

    // Determine gradient based on category
    let gradient = ["#4CAF50", "#81C784"] // Default green gradient

    if (item.type?.toLowerCase().includes("food") || item.collectionName === "Food Donations") {
      gradient = ["#FF9800", "#FFB74D"] // Orange for food
    } else if (item.type?.toLowerCase().includes("cloth") || item.collectionName === "Clothing Donations") {
      gradient = ["#2196F3", "#64B5F6"] // Blue for clothing
    } else if (item.type?.toLowerCase().includes("money") || item.collectionName === "Monetary Donations") {
      gradient = ["#4CAF50", "#81C784"] // Green for monetary
    } else if (item.type?.toLowerCase().includes("book")) {
      gradient = ["#9C27B0", "#BA68C8"] // Purple for books
    } else if (item.type?.toLowerCase().includes("medical")) {
      gradient = ["#E91E63", "#F06292"] // Pink for medical
    }

    return (
      <TouchableOpacity
        style={styles.donationCardContainer}
        activeOpacity={0.9}
        onPress={() =>
          userType === "donor" ? router.push("/donor/donationHistory") : router.push("/recipient/receivedDonations")
        }
      >
        <LinearGradient
          colors={["#1c3e35","#43b692"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.donationCardGradient}
        >
          <View style={styles.donationCardOverlay}>
            <View style={styles.donationHeader}>
              <Text style={styles.donationType}>{item.type || "Donation"}</Text>
            </View>

            <View style={styles.donationImageContainer}>
              <Image source={{ uri: categoryImage }} style={styles.donationImage} />
            </View>

            <View style={styles.donationContent}>
              {item.items && item.items.length > 0 && (
                <Text style={styles.donationItems} numberOfLines={1}>
                  {item.items.map((i) => i.name || i).join(", ")}
                </Text>
              )}

              {item.selectedItems && Object.keys(item.selectedItems).length > 0 && (
                <Text style={styles.donationItems} numberOfLines={1}>
                  {Object.entries(item.selectedItems)
                    .filter(([_, value]) => value > 0)
                    .map(([key]) => key)
                    .join(", ")}
                </Text>
              )}

              {userType === "donor" && item.recipientName && (
                <Text style={styles.donationRecipient} numberOfLines={1}>
                  To: {item.recipientName}
                </Text>
              )}

              {userType === "recipient" && item.donorName && (
                <Text style={styles.donationRecipient} numberOfLines={1}>
                  From: {item.donorName}
                </Text>
              )}

              <View style={styles.donationFooter}>
                <Text style={styles.donationTime}>{formatDate(item.timestamp)}</Text>

                {(item.amount > 0 || item.totalAmount > 0) && (
                  <Text style={styles.donationAmount}>₹{(item.amount || item.totalAmount || 0).toFixed(2)}</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const renderTestimonial = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const scale = testimonialScrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = testimonialScrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.testimonialContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient
          colors={["#0B5351", "#092327"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.testimonialCard}
        >
          <View style={styles.quoteIconTop}>
            <Text style={styles.quoteSymbol}>"</Text>
          </View>
          <Text style={styles.testimonialQuote}>{item.quote}</Text>
          <View style={styles.quoteIconBottom}>
            <Text style={styles.quoteSymbol}>"</Text>
          </View>
          <View style={styles.testimonialAuthorContainer}>
            <Text style={styles.testimonialAuthor}>{item.author}</Text>
            <Text style={styles.testimonialRole}>{item.role}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={["#0B5351", "#092327"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primaryDark} />

      {/* Header with Gradient Background */}
      <LinearGradient
        colors={["#0B5351", "#092327"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName || "Friend"}</Text>
          </View>
          <Image source={require("@/assets/images/welcome.png")} style={styles.logoImage} />
          
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Campaigns */}
        <View style={styles.section}>
          <Animated.FlatList
            ref={featuredRef}
            data={featuredCampaigns}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          />

          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {featuredCampaigns.map((_, index) => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.5, 1],
                extrapolate: "clamp",
              })
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: "clamp",
              })
              return <Animated.View key={index} style={[styles.paginationDot, { transform: [{ scale }], opacity }]} />
            })}
          </View>
        </View>

        {/* Impact Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
          </View>

          <Animated.FlatList
            data={impactStats}
            renderItem={renderImpactStat}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Shortcuts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.shortcutsContainer}>
            {userType === "donor" ? (
              <>
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/3081/3081792.png",
                  title: "Donate",
                  gradient: ["#4CAF50", "#81C784"],
                  onPress: () => router.push("/donor"),
                })}
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/2942/2942499.png",
                  title: "My Donations",
                  gradient: ["#2196F3", "#64B5F6"],
                  onPress: () => router.push("/donor/donationHistory"),
                })}
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/2076/2076218.png",
                  title: "Chat",
                  gradient: ["#FF9800", "#FFB74D"],
                  onPress: () => router.push("/chat"),
                })}
              </>
            ) : (
              <>
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/2942/2942499.png",
                  title: "Received",
                  gradient: ["#4CAF50", "#81C784"],
                  onPress: () => router.push("/recipient/receivedDonations"),
                })}
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/2076/2076218.png",
                  title: "Chat",
                  gradient: ["#2196F3", "#64B5F6"],
                  onPress: () => router.push("/chat"),
                })}
                {renderShortcut({
                  image: "https://cdn-icons-png.flaticon.com/512/3227/3227053.png",
                  title: "Request",
                  gradient: ["#FF9800", "#FFB74D"],
                  onPress: () => router.push("/recipient/request"),
                })}
              </>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{userType === "donor" ? "Recent Donations" : "Recently Received"}</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                router.push(userType === "donor" ? "/donor/donationHistory" : "/recipient/receivedDonations")
              }
            >
              <Text style={styles.viewAllText}>See More</Text>
              <ChevronRight width={16} height={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>

          {userType === "donor" ? (
            recentDonations.length > 0 ? (
              <Animated.FlatList
                data={recentDonations.slice(0, 5)}
                renderItem={renderDonationItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.donationsContainer}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/6598/6598519.png" }}
                  style={styles.emptyStateImage}
                  contentFit="contain"
                />
                <Text style={styles.emptyStateText}>No donations yet</Text>
                <Text style={styles.emptyStateSubtext}>Start making a difference today</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push("/donor")}>
                  <Text style={styles.emptyStateButtonText}>Donate Now</Text>
                </TouchableOpacity>
              </View>
            )
          ) : receivedDonations.length > 0 ? (
            <Animated.FlatList
              data={receivedDonations.slice(0, 5)}
              renderItem={renderDonationItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.donationsContainer}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/6598/6598519.png" }}
                style={styles.emptyStateImage}
                contentFit="contain"
              />
              <Text style={styles.emptyStateText}>No donations received yet</Text>
              <Text style={styles.emptyStateSubtext}>Donations will appear here when received</Text>
            </View>
          )}
        </View>

        {/* Testimonials / Quotes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inspiring Quotes</Text>
          </View>

          <Animated.FlatList
            ref={testimonialsRef}
            data={testimonials}
            renderItem={renderTestimonial}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            contentContainerStyle={styles.testimonialsContainer}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: testimonialScrollX } } }], {
              useNativeDriver: true,
            })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 16,
    fontSize: 16,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 10,
    
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.textLight,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  featuredItemContainer: {
    width: width,
    paddingHorizontal: 20,
  },
  featuredItem: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
    elevation: 8,
  },
  featuredImageContainer: {
    width: 100,
    height: 140,
    borderRadius: 20,
    // backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredImage: {
    width: 100,
    height: 120,
    // tintColor: "#fff",
    borderRadius: 14,
  },
  featuredContent: {
    flex: 1,
    justifyContent: "center",
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#182848",
    marginHorizontal: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statCardContainer: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCard: {
    width: 130,
    height: 150,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    width: 55,
    height: 55,
    borderRadius: 25,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  shortcutsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  shortcutButtonContainer: {
    width: "31%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  shortcutButton: {
    padding: 20,
    alignItems: "center",
    height: 120,
    justifyContent: "center",
  },
  shortcutIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shortcutIcon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textLight,
    textAlign: "center",
  },
  donationsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  donationCardContainer: {
    width: 180,
    height: 250,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  donationCardGradient: {
    flex: 1,
  },
  donationCardOverlay: {
    flex: 1,
    padding: 16,
  },
  donationHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  donationImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  donationImage: {
    width: 70,
    height: 70,
    borderRadius: 30,
  },
  donationContent: {
    flex: 1,
  },
  donationType: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textLight,
    textAlign: "center",
  },
  donationItems: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  donationRecipient: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  donationTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
  },
  testimonialsContainer: {
    paddingHorizontal: 16,
  },
  testimonialContainer: {
    width: width - 40,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  testimonialCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteIconTop: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  quoteIconBottom: {
    position: "absolute",
    bottom: 60,
    right: 20,
  },
  quoteSymbol: {
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.2)",
    fontWeight: "bold",
  },
  testimonialQuote: {
    fontSize: 18,
    fontWeight: "500",
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 28,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  testimonialAuthorContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  testimonialRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: THEME.card,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    tintColor: THEME.primary,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: THEME.textLight,
    fontWeight: "600",
  },
  logoImage: {
    width: 90,
    height: 90,
  },
})


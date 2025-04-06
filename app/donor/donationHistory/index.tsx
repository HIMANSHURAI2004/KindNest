"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  FlatList,
  Animated,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  Clock,
  Filter,
  ChevronDown,
  ChevronRight,
  MapPin,
  Coffee,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart2,
  List,
  Grid,
  X,
  ArrowLeft,
  User,
  Phone,
  Home,
} from "react-native-feather"
import { database as db } from "@/config/FirebaseConfig"
import { collection, getDocs, Timestamp, query, where, doc, getDoc, getCountFromServer } from "firebase/firestore"
import { getLocalStorage } from "@/service/Storage"

const { width } = Dimensions.get("window")

interface DonationItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface WishlistItem {
  id: string
  name: string
  category: string
  description: string
  requester: string
  recipientId: string
  status: string
  donorId: string
  fulfilledAt?: Timestamp
  timestamp?: Timestamp
}

interface RecipientInfo {
  id: string
  displayName: string
  email?: string
  organizationDetails?: {
    name: string
    type: string
    address: string
    contact: string
  }
}

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
  success: "#4CAF50",
}

// Get icon for donation type
const getDonationIcon = (type: string) => {
  switch (type) {
    case "Food":
      return Coffee
    case "Clothes":
      return ShoppingCart
    case "Money":
    case "Monetary":
      return DollarSign
    case "Others":
    case "Other":
      return Package
    default:
      return Package
  }
}

// Get color for donation type
const getDonationColor = (type: string) => {
  switch (type) {
    case "Food":
      return THEME.food
    case "Clothes":
      return THEME.clothes
    case "Money":
    case "Monetary":
      return THEME.money
    case "Others":
    case "Other":
      return THEME.other
    default:
      return THEME.primary
  }
}

// Cache for recipient information to avoid repeated fetches
const recipientCache: Record<string, RecipientInfo> = {}

// Fetch recipient information from users collection
const fetchRecipientInfo = async (recipientId: string): Promise<RecipientInfo | null> => {
  if (!recipientId) return null

  // Check cache first
  if (recipientCache[recipientId]) {
    return recipientCache[recipientId]
  }

  try {
    const userRef = doc(db, "users", recipientId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      const recipientInfo = {
        id: recipientId,
        displayName: userData.displayName || "Anonymous Recipient",
        email: userData.email,
        organizationDetails: userData.organizationDetails || null,
      }

      // Cache the result
      recipientCache[recipientId] = recipientInfo
      return recipientInfo
    }

    return null
  } catch (error) {
    console.error("Error fetching recipient info:", error)
    return null
  }
}

const fetchDonationCount = async (collectionName: string, donorId: string): Promise<number> => {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, where("donorId", "==", donorId)) // Filter by donorId
    const snapshot = await getCountFromServer(q) // Get filtered count
    return snapshot.data().count
  } catch (error) {
    console.error("Error getting filtered donation count:", error)
    return 0
  }
}

const fetchTotalMonetaryDonations = async (donorId: string): Promise<number> => {
  try {
    const monetaryCollection = collection(db, "Monetary Donations")
    const q = query(monetaryCollection, where("donorId", "==", donorId)) // Filter by donorId
    const snapshot = await getDocs(q)

    let totalAmount = 0

    snapshot.forEach((doc) => {
      const data = doc.data()

      // Only add successful payments
      if (typeof data.amount === "number") {
        totalAmount += data.amount
      }
    })

    return totalAmount
  } catch (error) {
    console.error("Error fetching monetary donations:", error)
    return 0
  }
}

const fetchAllDonations = async (donorId: string) => {
  try {
    const collections = ["Food Donations", "Clothing Donations", "Monetary Donations", "Other donations"]

    let allDonations: any[] = []

    // Fetch all donations from each collection
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName)
      const q = query(collectionRef, where("donorId", "==", donorId))
      const snapshot = await getDocs(q)

      const donations = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: collectionName.replace(" Donations", ""), // Store collection name for reference
        ...(doc.data() as { timestamp?: { toMillis: () => number } }),
      }))

      allDonations = [...allDonations, ...donations]
    }

    // Sort by timestamp (descending)
    allDonations.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0
      const timeB = b.timestamp?.toMillis?.() || 0
      return timeB - timeA
    })

    return allDonations
  } catch (error) {
    console.error("Error fetching donations:", error)
    return []
  }
}

// Fetch fulfilled wishlist donations
const fetchFulfilledWishlistDonations = async (donorId: string) => {
  try {
    const wishlistRef = collection(db, "wishlist")
    const q = query(wishlistRef, where("donorId", "==", donorId), where("status", "==", "fulfilled"))
    const snapshot = await getDocs(q)

    const wishlistItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WishlistItem[]

    // Sort by fulfilledAt timestamp (descending)
    wishlistItems.sort((a, b) => {
      const timeA = a.fulfilledAt?.toMillis?.() || a.timestamp?.toMillis?.() || 0
      const timeB = b.fulfilledAt?.toMillis?.() || b.timestamp?.toMillis?.() || 0
      return timeB - timeA
    })

    // Fetch recipient info for each donation
    const itemsWithRecipientInfo = await Promise.all(
      wishlistItems.map(async (item) => {
        const recipientInfo = await fetchRecipientInfo(item.recipientId)
        return {
          ...item,
          recipientInfo,
        }
      }),
    )

    return itemsWithRecipientInfo
  } catch (error) {
    console.error("Error fetching fulfilled wishlist donations:", error)
    return []
  }
}

// Extract time from timestamp
const extractTime = (timestamp: Timestamp | string) => {
  let date

  // If it's a Firestore Timestamp object, convert to Date
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate()
  }
  // If it's a string, convert it directly
  else if (typeof timestamp === "string") {
    date = new Date(timestamp)
  } else {
    return "Invalid Timestamp"
  }

  // Format the time (HH:MM AM/PM)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

const extractDate = (timestamp: any): string => {
  if (!timestamp?.toDate) return "Invalid timestamp"

  const dateObj = timestamp.toDate() // Convert Firestore Timestamp to JS Date
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const DonationHistory = () => {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"myDonations" | "fulfilled">("myDonations")
  const [loading, setLoading] = useState(true)

  const [donationCounts, setDonationCounts] = useState({
    Food: 0,
    Clothes: 0,
    Money: 0,
    Other: 0,
  })

  const [totalDonations, setTotalDonations] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [myDonations, setMyDonations] = useState<any[]>([])
  const [fulfilledDonations, setFulfilledDonations] = useState<any[]>([])
  const [filteredDonations, setFilteredDonations] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const filterAnimation = new Animated.Value(0)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const userInfo = await getLocalStorage("userDetail")
      const uid = userInfo?.uid || userInfo?.id || null
      setUserId(uid)

      if (uid) {
        // Fetch direct donations
        const directDonations = await fetchAllDonations(uid)
        setMyDonations(directDonations)

        // Fetch fulfilled wishlist donations
        const wishlistDonations = await fetchFulfilledWishlistDonations(uid)
        setFulfilledDonations(wishlistDonations)

        // Fetch donation counts
        const foodCount = await fetchDonationCount("Food Donations", uid)
        const clothesCount = await fetchDonationCount("Clothing Donations", uid)
        const moneyCount = await fetchDonationCount("Monetary Donations", uid)
        const otherCount = await fetchDonationCount("Other donations", uid)
        const total = await fetchTotalMonetaryDonations(uid)

        setTotalAmount(total)
        setDonationCounts({
          Food: foodCount,
          Clothes: clothesCount,
          Money: moneyCount,
          Other: otherCount,
        })

        setTotalDonations(foodCount + clothesCount + moneyCount + otherCount + wishlistDonations.length)
      }

      setLoading(false)
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    // Filter donations based on active tab and selected category
    if (activeTab === "myDonations") {
      if (selectedCategory) {
        setFilteredDonations(
          myDonations.filter((donation) => {
            const donationType = donation.type?.toLowerCase() || ""
            const donationCategory = donation.category?.toLowerCase() || ""
            const selectedCategoryLower = selectedCategory.toLowerCase()

            // Handle special cases for Monetary/Money and Clothing/Clothes
            if (selectedCategoryLower === "money" && (donationType === "monetary" || donationType.includes("money"))) {
              return true
            }

            if (
              selectedCategoryLower === "clothes" &&
              (donationType === "clothing" || donationType.includes("cloth"))
            ) {
              return true
            }

            return donationType.includes(selectedCategoryLower) || donationCategory.includes(selectedCategoryLower)
          }),
        )
      } else {
        setFilteredDonations(myDonations)
      }
    } else {
      if (selectedCategory) {
        setFilteredDonations(
          fulfilledDonations.filter((donation) => {
            const category = donation.category?.toLowerCase() || ""
            const selectedCategoryLower = selectedCategory.toLowerCase()

            // Handle special cases for Monetary/Money and Clothing/Clothes
            if (selectedCategoryLower === "money" && (category === "monetary" || category.includes("money"))) {
              return true
            }

            if (selectedCategoryLower === "clothes" && (category === "clothing" || category.includes("cloth"))) {
              return true
            }

            return category.includes(selectedCategoryLower)
          }),
        )
      } else {
        setFilteredDonations(fulfilledDonations)
      }
    }
  }, [activeTab, selectedCategory, myDonations, fulfilledDonations])

  const toggleFilters = () => {
    const newValue = !showFilters
    setShowFilters(newValue)
    Animated.timing(filterAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const filterHeight = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  })

  const handleGoBack = () => {
    router.replace("/(tabs)")
  }

  const renderMyDonationCard = ({ item }: { item: any }) => {
    const isExpanded = selectedDonation === item.id
    const donationType = item.type || item.category || "Other"
    const DonationIcon = getDonationIcon(donationType)
    const donationColor = getDonationColor(donationType)

    return (
      <TouchableOpacity
        style={[styles.donationCard, isExpanded && styles.donationCardExpanded]}
        activeOpacity={0.9}
        onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
      >
        <View style={styles.donationCardHeader}>
          <View style={styles.donationTypeContainer}>
            <View style={[styles.donationIconContainer, { backgroundColor: `${donationColor}20` }]}>
              <DonationIcon width={20} height={20} color={donationColor} />
            </View>
            <View>
              <Text style={styles.donationType}>{donationType} Donation</Text>
              <Text style={styles.donationDate}>{extractDate(item.timestamp)}</Text>
            </View>
          </View>

          {(item.amount || item.totalAmount || item.totalItems) && (
            <View style={styles.donationStatusContainer}>
              {(item.amount > 0 || item.totalAmount > 0) && (
                <Text style={styles.donationAmount}>₹{item.amount?.toFixed(2) || item.totalAmount?.toFixed(2)}</Text>
              )}
              {item.totalItems > 0 && <Text style={styles.donationAmount}>{item.totalItems} items</Text>}
              {item.status && (
                <View style={[styles.statusBadge, { backgroundColor: `${THEME.primary}20` }]}>
                  <Text style={[styles.statusText, { color: THEME.primary }]}>{item.status}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.donationCardBody}>
          <View style={styles.donationDetail}>
            <Clock width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>{item.selectedTimeSlot || extractTime(item.timestamp)}</Text>
          </View>

          {item.pickupAddress && (
            <View style={styles.donationDetail}>
              <MapPin width={16} height={16} color={THEME.textMuted} />
              <Text style={styles.donationDetailText}>{item.pickupAddress}</Text>
            </View>
          )}

          {item.items && isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Donated Items:</Text>
              {item.items.map((itemObj: DonationItem, index: number) => (
                <View key={index} style={styles.donatedItem}>
                  <View style={styles.donatedItemBullet} />
                  <Text style={styles.donatedItemText}>
                    {itemObj.name} ({itemObj.quantity})
                  </Text>
                </View>
              ))}
              <View style={styles.wishlistItemRequester}>
                <User width={14} height={14} color={THEME.textMuted} />
                <Text style={styles.wishlistItemRequesterText}>
                  Received by: {item.recipientName || "Recipient"} {item.recipientType ? `(${item.recipientType})` : ""}
                </Text>
              </View>
            </View>
          )}

          {item.selectedItems && isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Donated Items:</Text>
              {Object.entries(item.selectedItems)
                .filter(([_, value]) => value > 0) // Only include items with value > 0
                .map(([itemName, _], index) => (
                  <View key={index} style={styles.donatedItem}>
                    <View style={styles.donatedItemBullet} />
                    <Text style={styles.donatedItemText}>{itemName}</Text>
                  </View>
                ))}
            </View>
          )}
          {!item.items && !item.selectedItems && isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.wishlistItemRequester}>
                <User width={14} height={14} color={THEME.textMuted} />
                <Text style={styles.wishlistItemRequesterText}>
                  Received by: {item.recipientName || item.recipientId || "Recipient"}{" "}
                  {item.recipientType ? `(${item.recipientType})` : ""}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
          >
            <Text style={styles.expandButtonText}>{isExpanded ? "Show Less" : "Show More"}</Text>
            {isExpanded ? (
              <ChevronDown width={16} height={16} color={THEME.textMuted} />
            ) : (
              <ChevronRight width={16} height={16} color={THEME.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFulfilledDonationCard = ({ item }: { item: any }) => {
    const isExpanded = selectedDonation === item.id
    const CategoryIcon = getDonationIcon(item.category)
    const categoryColor = getDonationColor(item.category)
    const recipientInfo = item.recipientInfo

    return (
      <TouchableOpacity
        style={[styles.donationCard, isExpanded && styles.donationCardExpanded]}
        activeOpacity={0.9}
        onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
      >
        <View style={styles.donationCardHeader}>
          <View style={styles.donationTypeContainer}>
            <View style={[styles.donationIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <CategoryIcon width={20} height={20} color={categoryColor} />
            </View>
            <View>
              <Text style={styles.donationType}>{item.name}</Text>
              <Text style={styles.donationDate}>{item.category}</Text>
            </View>
          </View>

          <View style={styles.donationStatusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${THEME.success}20` }]}>
              <Text style={[styles.statusText, { color: THEME.success }]}>FULFILLED</Text>
            </View>
          </View>
        </View>

        <View style={styles.donationCardBody}>
          <View style={styles.donationDetail}>
            <Clock width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>
              {item.fulfilledAt ? extractDate(item.fulfilledAt) : extractDate(item.timestamp)}
            </Text>
          </View>

          <View style={styles.donationDetail}>
            <User width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>Requested by: {item.requester}</Text>
          </View>

          {recipientInfo && recipientInfo.organizationDetails && (
            <View style={styles.donationDetail}>
              <Home width={16} height={16} color={THEME.textMuted} />
              <Text style={styles.donationDetailText}>
                Organization: {recipientInfo.organizationDetails.name || "Not specified"}
              </Text>
            </View>
          )}

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Request Description:</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>

              {recipientInfo && recipientInfo.organizationDetails && (
                <View style={styles.organizationDetails}>
                  <Text style={styles.organizationTitle}>Recipient Organization Details:</Text>

                  <View style={styles.organizationDetail}>
                    <Home width={14} height={14} color={THEME.primary} />
                    <Text style={styles.organizationDetailText}>
                      Type: {recipientInfo.organizationDetails.type || "Not specified"}
                    </Text>
                  </View>

                  <View style={styles.organizationDetail}>
                    <MapPin width={14} height={14} color={THEME.primary} />
                    <Text style={styles.organizationDetailText}>
                      Address: {recipientInfo.organizationDetails.address || "No address provided"}
                    </Text>
                  </View>

                  <View style={styles.organizationDetail}>
                    <Phone width={14} height={14} color={THEME.primary} />
                    <Text style={styles.organizationDetailText}>
                      Contact: {recipientInfo.organizationDetails.contact || "No contact provided"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
          >
            <Text style={styles.expandButtonText}>{isExpanded ? "Show Less" : "Show More"}</Text>
            {isExpanded ? (
              <ChevronDown width={16} height={16} color={THEME.textMuted} />
            ) : (
              <ChevronRight width={16} height={16} color={THEME.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderGridItem = ({ item }: { item: any }) => {
    const donationType = activeTab === "myDonations" ? item.type || item.category || "Other" : item.category
    const DonationIcon = getDonationIcon(donationType)
    const donationColor = getDonationColor(donationType)
    const recipientInfo = activeTab === "fulfilled" ? item.recipientInfo : null

    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.8}
        onPress={() => setSelectedDonation(selectedDonation === item.id ? null : item.id)}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: `${donationColor}20` }]}>
          <DonationIcon width={24} height={24} color={donationColor} />
        </View>

        <Text style={styles.gridCardType}>{activeTab === "myDonations" ? donationType : item.name}</Text>

        {activeTab === "myDonations" && <Text style={styles.gridCardDate}>{extractDate(item.timestamp)}</Text>}

        {activeTab === "fulfilled" && <Text style={styles.gridCardDate}>{item.category}</Text>}

        {activeTab === "myDonations" && item.amount > 0 && (
          <Text style={styles.gridCardAmount}>₹{item.amount.toFixed(2)}</Text>
        )}

        {activeTab === "myDonations" && item.totalAmount > 0 && (
          <Text style={styles.gridCardAmount}>₹{item.totalAmount.toFixed(2)}</Text>
        )}

        {activeTab === "myDonations" && item.totalItems > 0 && (
          <Text style={styles.gridCardAmount}>{item.totalItems} Items</Text>
        )}

        {activeTab === "fulfilled" && recipientInfo && recipientInfo.organizationDetails && (
          <Text style={styles.gridCardOrg}>{recipientInfo.organizationDetails.name || "Organization"}</Text>
        )}

        {item.status && activeTab === "myDonations" && (
          <View style={[styles.gridStatusBadge, { backgroundColor: `${THEME.primary}20` }]}>
            <Text style={[styles.gridStatusText, { color: THEME.primary }]}>{item.status}</Text>
          </View>
        )}

        {activeTab === "fulfilled" && (
          <View style={[styles.gridStatusBadge, { backgroundColor: `${THEME.success}20` }]}>
            <Text style={[styles.gridStatusText, { color: THEME.success }]}>FULFILLED</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0B5351", "#092327"]} style={styles.headerGradient}>
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
            <ArrowLeft width={20} height={20} color={THEME.textLight} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <BarChart2 width={28} height={28} color={THEME.textLight} />
            <Text style={styles.headerTitle}>Donation History</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your contributions and impact</Text>
        </View>

        {/* Statistics Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationCounts.Food || 0}</Text>
            <Text style={styles.statLabel}>Food Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationCounts.Clothes || 0}</Text>
            <Text style={styles.statLabel}>Clothes Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fulfilledDonations.length}</Text>
            <Text style={styles.statLabel}>Fulfilled Requests</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "myDonations" && styles.activeTab]}
            onPress={() => setActiveTab("myDonations")}
          >
            <Text style={[styles.tabText, activeTab === "myDonations" && styles.activeTabText]}>Donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "fulfilled" && styles.activeTab]}
            onPress={() => setActiveTab("fulfilled")}
          >
            <Text style={[styles.tabText, activeTab === "fulfilled" && styles.activeTabText]}>Fulfilled Donations</Text>
          </TouchableOpacity>
        </View>

        {/* Filter and View Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
            <Filter width={18} height={18} color={THEME.primary} />
            <Text style={styles.filterButtonText}>{selectedCategory ? selectedCategory : "All Categories"}</Text>
            <ChevronDown width={16} height={16} color={THEME.primary} />
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "list" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <List width={18} height={18} color={viewMode === "list" ? THEME.textLight : THEME.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "grid" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid width={18} height={18} color={viewMode === "grid" ? THEME.textLight : THEME.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Panel */}
        <Animated.View
          style={[
            styles.filterPanel,
            {
              height: filterHeight,
              overflow: showFilters ? "visible" : "hidden",
              zIndex: showFilters ? 10 : 0,
            },
          ]}
        >
          <View style={styles.filterContent}>
            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === null && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryFilterText, selectedCategory === null && styles.categoryFilterTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Food" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Food")}
            >
              <Coffee width={16} height={16} color={selectedCategory === "Food" ? THEME.textLight : THEME.food} />
              <Text style={[styles.categoryFilterText, selectedCategory === "Food" && styles.categoryFilterTextActive]}>
                Food
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Clothes" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Clothes")}
            >
              <ShoppingCart
                width={16}
                height={16}
                color={selectedCategory === "Clothes" ? THEME.textLight : THEME.clothes}
              />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Clothes" && styles.categoryFilterTextActive]}
              >
                Clothes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Money" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Money")}
            >
              <DollarSign width={16} height={16} color={selectedCategory === "Money" ? THEME.textLight : THEME.money} />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Money" && styles.categoryFilterTextActive]}
              >
                Money
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Other" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Other")}
            >
              <Package width={16} height={16} color={selectedCategory === "Other" ? THEME.textLight : THEME.other} />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Other" && styles.categoryFilterTextActive]}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeFiltersButton} onPress={toggleFilters}>
            <X width={20} height={20} color={THEME.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Loading donation history...</Text>
          </View>
        ) : /* Donations List/Grid */
        viewMode === "list" ? (
          <FlatList
            key="list"
            data={filteredDonations}
            renderItem={activeTab === "myDonations" ? renderMyDonationCard : renderFulfilledDonationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.donationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Package width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === "myDonations"
                    ? "You haven't made any direct donations yet"
                    : "You haven't fulfilled any donation requests yet"}
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="grid"
            data={filteredDonations}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridColumnWrapper}
            contentContainerStyle={styles.donationsGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Package width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === "myDonations"
                    ? "You haven't made any direct donations yet"
                    : "You haven't fulfilled any donation requests yet"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 0,
    zIndex: 10,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 40, // Make space for the back button
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.textLight,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: THEME.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
  },
  activeTabText: {
    color: THEME.textLight,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginHorizontal: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  viewToggleButtonActive: {
    backgroundColor: THEME.primary,
  },
  filterPanel: {
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "absolute", // Make it absolute positioned
    top: 110, // Position it below the tabs and controls
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it's above other content
  },
  filterContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 10,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#092327", // Ensure background is solid
  },
  categoryFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryFilterActive: {
    backgroundColor: THEME.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginLeft: 6,
  },
  categoryFilterTextActive: {
    color: THEME.textLight,
  },
  closeFiltersButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.textMuted,
  },
  donationsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  donationsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  gridColumnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  donationCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  donationCardExpanded: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  donationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  donationTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  donationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  donationType: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  donationDate: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  donationStatusContainer: {
    alignItems: "flex-end",
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  donationCardBody: {
    padding: 16,
  },
  donationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  donationDetailText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    // borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  expandedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  donatedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  donatedItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primary,
    marginRight: 8,
  },
  donatedItemText: {
    fontSize: 14,
    color: THEME.text,
  },
  descriptionText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginRight: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    padding: 12,
    alignItems: "center",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButtonText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginRight: 4,
  },
  gridCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  gridIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridCardType: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
    textAlign: "center",
  },
  gridCardDate: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 8,
  },
  gridCardAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
  },
  gridCardOrg: {
    fontSize: 13,
    color: THEME.primary,
    marginBottom: 8,
    fontWeight: "500",
    textAlign: "center",
  },
  gridStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  wishlistItemRequester: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  wishlistItemRequesterText: {
    fontSize: 13,
    color: THEME.textMuted,
    marginLeft: 6,
    fontStyle: "italic",
  },
  organizationDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(31, 105, 105, 0.05)",
    borderRadius: 8,
  },
  organizationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.primary,
    marginBottom: 10,
  },
  organizationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  organizationDetailText: {
    fontSize: 14,
    color: THEME.text,
    marginLeft: 8,
  },
})

export default DonationHistory



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
  Package,
  BarChart2,
  List,
  Grid,
  X,
  ArrowLeft,
  AlertTriangle,
  ShoppingBag,
  User,
  ShoppingCart,
} from "react-native-feather"
import { database as db } from "@/config/FirebaseConfig"
import { collection, getDocs, Timestamp, query, where, doc, getDoc } from "firebase/firestore"
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
}

interface DonorInfo {
  id: string
  name: string
  email?: string
  phone?: string
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
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
}

// Categories with icons and colors
const categories = [
  {
    value: "Food",
    label: "Food & Nutrition",
    icon: Coffee,
    color: "#FF9800",
  },
  {
    value: "Clothing",
    label: "Clothes & Garments",
    icon: ShoppingCart,
    color: "#2196F3",
  },
  {
    value: "Monetary",
    label: "Monetary",
    icon: DollarSign,
    color: "#4CAF50",
  },
  {
    value: "Other",
    label: "Miscellaneous",
    icon: Package,
    color: "#9C27B0",
  },
]

// Get icon for category
const getCategoryIcon = (categoryName: string) => {
  // Normalize category name for matching
  const normalizedCategory = categoryName?.toLowerCase() || ""

  if (normalizedCategory.includes("food")) return Coffee
  if (normalizedCategory.includes("cloth")) return ShoppingCart
  if (normalizedCategory.includes("money") || normalizedCategory.includes("monetary")) return DollarSign

  // Find in categories array as fallback
  const category = categories.find(
    (cat) => cat.value.toLowerCase() === normalizedCategory || cat.label.toLowerCase().includes(normalizedCategory),
  )
  return category ? category.icon : ShoppingBag
}

// Get color for category
const getCategoryColor = (categoryName: string) => {
  // Normalize category name for matching
  const normalizedCategory = categoryName?.toLowerCase() || ""

  if (normalizedCategory.includes("food")) return THEME.food
  if (normalizedCategory.includes("cloth")) return THEME.clothes
  if (normalizedCategory.includes("money") || normalizedCategory.includes("monetary")) return THEME.money
  if (normalizedCategory.includes("other")) return THEME.other

  // Find in categories array as fallback
  const category = categories.find(
    (cat) => cat.value.toLowerCase() === normalizedCategory || cat.label.toLowerCase().includes(normalizedCategory),
  )
  return category ? category.color : THEME.primary
}

// Format date
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

  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
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

// Cache for donor information to avoid repeated fetches
const donorCache: Record<string, DonorInfo> = {}

// Fetch donor information from users collection
const fetchDonorInfo = async (donorId: string): Promise<DonorInfo | null> => {
  if (!donorId) return null

  // Check cache first
  if (donorCache[donorId]) {
    return donorCache[donorId]
  }

  try {
    const userRef = doc(db, "users", donorId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      const donorInfo = {
        id: donorId,
        name: userData.name || userData.displayName || "Anonymous Donor",
        email: userData.email,
        phone: userData.phone,
      }

      // Cache the result
      donorCache[donorId] = donorInfo
      return donorInfo
    }

    return null
  } catch (error) {
    console.error("Error fetching donor info:", error)
    return null
  }
}

const ReceivedDonations = () => {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"received" | "requested">("received")

  const [userId, setUserId] = useState<string | null>(null)
  const [receivedDonations, setReceivedDonations] = useState<any[]>([])
  const [requestedDonations, setRequestedDonations] = useState<WishlistItem[]>([])
  const [filteredDonations, setFilteredDonations] = useState<any[]>([])
  const [donorsInfo, setDonorsInfo] = useState<Record<string, DonorInfo>>({})

  const [donationStats, setDonationStats] = useState({
    totalReceived: 0,
    totalMonetary: 0,
    foodCount: 0,
    clothesCount: 0,
    otherCount: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
  })

  const filterAnimation = new Animated.Value(0)

  // Fetch all donations received by the recipient
  const fetchReceivedDonations = async (recipientId: string) => {
    try {
      const collections = ["Food Donations", "Clothing Donations", "Monetary Donations", "Other donations"]

      let allDonations: any[] = []
      let foodCount = 0
      let clothesCount = 0
      let otherCount = 0
      let totalMonetary = 0
      const donorIds = new Set<string>()

      // Fetch all donations from each collection
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName)
        const q = query(collectionRef, where("recipientId", "==", recipientId))
        const snapshot = await getDocs(q)

        const donations = snapshot.docs.map((doc) => {
          const data = doc.data()

          // Add donor ID to the set for later fetching
          if (data.donorId) {
            donorIds.add(data.donorId)
          }

          // Normalize category name based on collection
          let categoryName = ""
          if (collectionName === "Food Donations") {
            categoryName = "Food"
            foodCount++
          } else if (collectionName === "Clothing Donations") {
            categoryName = "Clothing"
            clothesCount++
          } else if (collectionName === "Other donations") {
            categoryName = "Other"
            otherCount++
          } else if (collectionName === "Monetary Donations") {
            categoryName = "Monetary"
            if (data.amount) {
              totalMonetary += data.amount
            }
          }

          return {
            id: doc.id,
            type: categoryName,
            collectionName,
            ...data,
          }
        })

        allDonations = [...allDonations, ...donations]
      }

      // Sort by timestamp (descending)
      allDonations.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0
        const timeB = b.timestamp?.toMillis?.() || 0
        return timeB - timeA
      })

      setDonationStats((prev) => ({
        ...prev,
        totalReceived: allDonations.length,
        totalMonetary,
        foodCount,
        clothesCount,
        otherCount,
      }))

      // Fetch donor information for all donations
      const donorsData: Record<string, DonorInfo> = {}
      for (const donorId of donorIds) {
        const donorInfo = await fetchDonorInfo(donorId)
        if (donorInfo) {
          donorsData[donorId] = donorInfo
        }
      }
      setDonorsInfo(donorsData)

      return allDonations
    } catch (error) {
      console.error("Error fetching received donations:", error)
      return []
    }
  }

  // Fetch all wishlist requests made by the recipient
  const fetchRequestedDonations = async (recipientId: string) => {
    try {
      const wishlistRef = collection(db, "wishlist")
      const q = query(wishlistRef, where("recipientId", "==", recipientId))
      const snapshot = await getDocs(q)

      const wishlistItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WishlistItem[]

      // Sort by most recent first (if timestamp exists)
      wishlistItems.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis?.() || 0
        const timeB = b.timestamp?.toMillis?.() || 0
        return timeB - timeA
      })

      // Count pending and fulfilled requests
      const pendingRequests = wishlistItems.filter((item) => item.status === "pending").length
      const fulfilledRequests = wishlistItems.filter((item) => item.status === "fulfilled").length

      setDonationStats((prev) => ({
        ...prev,
        pendingRequests,
        fulfilledRequests,
      }))

      return wishlistItems
    } catch (error) {
      console.error("Error fetching wishlist requests:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = await getLocalStorage("userDetail")
      const uid = userInfo?.uid || userInfo?.id || null
      setUserId(uid)

      if (uid) {
        const donations = await fetchReceivedDonations(uid)
        setReceivedDonations(donations)

        const wishlist = await fetchRequestedDonations(uid)
        setRequestedDonations(wishlist)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Filter donations based on active tab and selected category
    if (activeTab === "received") {
      if (selectedCategory) {
        // Improved filtering logic to handle different category naming conventions
        setFilteredDonations(
          receivedDonations.filter((donation) => {
            const donationType = donation.type?.toLowerCase() || ""
            const donationCategory = donation.category?.toLowerCase() || ""
            const selectedCategoryLower = selectedCategory.toLowerCase()

            return (
              donationType.includes(selectedCategoryLower) ||
              donationCategory.includes(selectedCategoryLower) ||
              (selectedCategoryLower === "food" && donation.collectionName === "Food Donations") ||
              (selectedCategoryLower === "clothing" && donation.collectionName === "Clothing Donations") ||
              (selectedCategoryLower === "monetary" && donation.collectionName === "Monetary Donations") ||
              (selectedCategoryLower === "other" && donation.collectionName === "Other donations")
            )
          }),
        )
      } else {
        setFilteredDonations(receivedDonations)
      }
    } else {
      if (selectedCategory) {
        setFilteredDonations(
          requestedDonations.filter((item) => item.category?.toLowerCase().includes(selectedCategory.toLowerCase())),
        )
      } else {
        setFilteredDonations(requestedDonations)
      }
    }
  }, [activeTab, selectedCategory, receivedDonations, requestedDonations])

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

  const renderReceivedDonationCard = ({ item }: { item: any }) => {
    const isExpanded = selectedDonation === item.id
    const donationType = item.type || item.category || "Other"
    const DonationIcon = getCategoryIcon(donationType)
    const donationColor = getCategoryColor(donationType)

    // Get donor info if available
    const donorInfo = item.donorId ? donorsInfo[item.donorId] : null

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
              <Text style={styles.donationDate}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>

          <View style={styles.donationStatusContainer}>
            {(item.amount > 0 || item.totalAmount > 0) && (
              <Text style={styles.donationAmount}>₹{(item.amount || item.totalAmount || 0).toFixed(2)}</Text>
            )}
            {item.totalItems > 0 && <Text style={styles.donationAmount}>{item.totalItems} items</Text>}
            {item.status && (
              <View style={[styles.statusBadge, { backgroundColor: `${THEME.primary}20` }]}>
                <Text style={[styles.statusText, { color: THEME.primary }]}>{item.status}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.donationCardBody}>
          <View style={styles.donationDetail}>
            <Clock width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>{item.selectedTimeSlot || extractTime(item.timestamp)}</Text>
          </View>

          {donorInfo && (
            <View style={styles.donationDetail}>
              <User width={16} height={16} color={THEME.textMuted} />
              <Text style={styles.donationDetailText}>Donated by: {donorInfo.name}</Text>
            </View>
          )}

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

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <ChevronRight width={16} height={16} color={THEME.primary} />
              </TouchableOpacity>
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

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <ChevronRight width={16} height={16} color={THEME.primary} />
              </TouchableOpacity>
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

  const renderRequestedDonationCard = ({ item }: { item: WishlistItem }) => {
    const isExpanded = selectedDonation === item.id
    const CategoryIcon = getCategoryIcon(item.category)
    const categoryColor = getCategoryColor(item.category)

    // Determine status color
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case "fulfilled":
          return THEME.success
        case "pending":
          return THEME.warning
        case "rejected":
          return THEME.error
        default:
          return THEME.primary
      }
    }

    const statusColor = getStatusColor(item.status)

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
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.donationCardBody}>
          <View style={styles.donationDetail}>
            <User width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>Requested by: {item.requester}</Text>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Request Description:</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <ChevronRight width={16} height={16} color={THEME.primary} />
              </TouchableOpacity>
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
    const donationType = activeTab === "received" ? item.type || item.category || "Other" : item.category
    const DonationIcon = getCategoryIcon(donationType)
    const donationColor = getCategoryColor(donationType)

    // Get donor info if available
    const donorInfo = activeTab === "received" && item.donorId ? donorsInfo[item.donorId] : null

    // For requested items, determine status color
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case "fulfilled":
          return THEME.success
        case "pending":
          return THEME.warning
        case "rejected":
          return THEME.error
        default:
          return THEME.primary
      }
    }

    const statusColor = activeTab === "requested" ? getStatusColor(item.status) : THEME.primary

    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.8}
        onPress={() => setSelectedDonation(selectedDonation === item.id ? null : item.id)}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: `${donationColor}20` }]}>
          <DonationIcon width={24} height={24} color={donationColor} />
        </View>

        <Text style={styles.gridCardType}>{activeTab === "received" ? donationType : item.name}</Text>

        {activeTab === "received" && <Text style={styles.gridCardDate}>{formatDate(item.timestamp)}</Text>}

        {activeTab === "received" && donorInfo && <Text style={styles.gridCardDonor}>By: {donorInfo.name}</Text>}

        {activeTab === "requested" && <Text style={styles.gridCardDate}>{item.category}</Text>}

        {activeTab === "received" && item.amount > 0 && (
          <Text style={styles.gridCardAmount}>₹{item.amount.toFixed(2)}</Text>
        )}

        {activeTab === "received" && item.totalAmount > 0 && (
          <Text style={styles.gridCardAmount}>₹{item.totalAmount.toFixed(2)}</Text>
        )}

        {activeTab === "received" && item.totalItems > 0 && (
          <Text style={styles.gridCardAmount}>{item.totalItems} Items</Text>
        )}

        {item.status && (
          <View
            style={[
              styles.gridStatusBadge,
              { backgroundColor: `${activeTab === "requested" ? statusColor : THEME.primary}20` },
            ]}
          >
            <Text style={[styles.gridStatusText, { color: activeTab === "requested" ? statusColor : THEME.primary }]}>
              {item.status}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0B5351", "#092327"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BarChart2 width={28} height={28} color={THEME.textLight} />
            <Text style={styles.headerTitle}>Received Donations</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track donations received and requested</Text>
        </View>

        {/* Statistics Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.totalReceived+donationStats.fulfilledRequests}</Text>
            <Text style={styles.statLabel}>Total Received</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{donationStats.totalMonetary.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Monetary Value</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.foodCount}</Text>
            <Text style={styles.statLabel}>Food Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.clothesCount}</Text>
            <Text style={styles.statLabel}>Clothes Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.otherCount}</Text>
            <Text style={styles.statLabel}>Other Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationStats.fulfilledRequests}</Text>
            <Text style={styles.statLabel}>Fulfilled Requests</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "received" && styles.activeTab]}
            onPress={() => setActiveTab("received")}
          >
            <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>Received Donations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "requested" && styles.activeTab]}
            onPress={() => setActiveTab("requested")}
          >
            <Text style={[styles.tabText, activeTab === "requested" && styles.activeTabText]}>Requested Donations</Text>
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
              style={[styles.categoryFilter, selectedCategory === "Clothing" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Clothing")}
            >
              <ShoppingCart width={16} height={16} color={selectedCategory === "Clothing" ? THEME.textLight : THEME.clothes} />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Clothing" && styles.categoryFilterTextActive]}
              >
                Clothes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Monetary" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Monetary")}
            >
              <DollarSign
                width={16}
                height={16}
                color={selectedCategory === "Monetary" ? THEME.textLight : THEME.money}
              />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Monetary" && styles.categoryFilterTextActive]}
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

        {/* Donations List/Grid */}
        {viewMode === "list" ? (
          <FlatList
            key="list"
            data={filteredDonations}
            renderItem={activeTab === "received" ? renderReceivedDonationCard : renderRequestedDonationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.donationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AlertTriangle width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === "received"
                    ? "You haven't received any donations in this category yet"
                    : "You haven't requested any donations in this category yet"}
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
                <AlertTriangle width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {activeTab === "received"
                    ? "You haven't received any donations in this category yet"
                    : "You haven't requested any donations in this category yet"}
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
    fontSize: 26,
    fontWeight: "bold",
    color: THEME.textLight,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
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
    borderTopWidth: 1,
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
  },
  gridCardDate: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 8,
  },
  gridCardDonor: {
    fontSize: 13,
    color: THEME.primary,
    marginBottom: 8,
    fontStyle: "italic",
  },
  gridCardAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
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
})

export default ReceivedDonations


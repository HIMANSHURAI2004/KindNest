import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  Clock,
  ChevronRight,
  MapPin,
  Coffee,
  ShoppingCart,
  Package,
  Activity,
  Gift,
  AlertTriangle,
  ShoppingBag,
  User,
  Phone,
  Home,
  Heart,
  Calendar,
} from "react-native-feather"
import { database as db } from "@/config/FirebaseConfig"
import { collection, getDocs, Timestamp, query, where, doc, getDoc, updateDoc } from "firebase/firestore"
import { getLocalStorage } from "@/service/Storage"


interface WishlistItem {
  id: string
  name: string
  category: string
  description: string
  requester: string
  recipientId: string
  status: string
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
    value: "Clothes",
    label: "Clothes & Garments",
    icon: ShoppingCart,
    color: "#2196F3",
  },
  {
    value: "Toys",
    label: "Toys & Games",
    icon: Gift,
    color: "#9C27B0",
  },
  {
    value: "Medical Supplies",
    label: "Medical Supplies",
    icon: Activity,
    color: "#F44336",
  },
  {
    value: "Miscellaneous",
    label: "Miscellaneous",
    icon: Package,
    color: "#9C27B0",
  },
]

// Get icon for category
const getCategoryIcon = (categoryName: string) => {
  const category = categories.find((cat) => cat.value === categoryName)
  return category ? category.icon : ShoppingBag
}

// Get color for category
const getCategoryColor = (categoryName: string) => {
  const category = categories.find((cat) => cat.value === categoryName)
  return category ? category.color : THEME.primary
}

// Format date
const formatDate = (timestamp: Timestamp | string | undefined) => {
  if (!timestamp) return "No date"

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

// Format time
const formatTime = (timestamp: Timestamp | string | undefined) => {
  if (!timestamp) return ""

  let date
  // If it's a Firestore Timestamp object, convert to Date
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate()
  }
  // If it's a string, convert it directly
  else if (typeof timestamp === "string") {
    date = new Date(timestamp)
  } else {
    return ""
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
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

const RequestedDonations = () => {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null)
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [donatingItem, setDonatingItem] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getLocalStorage("userDetail")
      const uid = userInfo?.uid || userInfo?.id || null
      setUserId(uid)
    }

    fetchUserInfo()
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const wishlistRef = collection(db, "wishlist")
      const q = query(wishlistRef, where("status", "==", "pending"))

      const snapshot = await getDocs(q)
      // console.log(snapshot)

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WishlistItem[]

      // Sort by timestamp if it exists, otherwise keep the order from the query
      const sortedItems = items.sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0
        if (!a.timestamp) return 1
        if (!b.timestamp) return -1
        return b.timestamp.toMillis() - a.timestamp.toMillis()
      })

      setWishlistItems(sortedItems)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      Alert.alert("Error", "Failed to load donation requests. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (item: WishlistItem) => {
    setSelectedItem(item)

    try {
      const recipient = await fetchRecipientInfo(item.recipientId)
      setRecipientInfo(recipient)
      setModalVisible(true)
    } catch (error) {
      console.error("Error fetching recipient details:", error)
      Alert.alert("Error", "Failed to load recipient details. Please try again.")
    }
  }

  const handleDonate = (itemId: string) => {
    setDonatingItem(itemId)

    Alert.alert("Confirm Donation", "Are you sure you want to fulfill this donation request?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setDonatingItem(null),
      },
      {
        text: "Confirm",
        onPress: () => confirmDonation(itemId),
      },
    ])
  }

  const confirmDonation = async (itemId: string) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to donate.")
      setDonatingItem(null)
      return
    }

    try {
      const wishlistRef = doc(db, "wishlist", itemId)

      await updateDoc(wishlistRef, {
        status: "fulfilled",
        donorId: userId,
        fulfilledAt: Timestamp.now(),
      })

      Alert.alert("Donation Successful", "Thank you for your generosity! Your donation has been confirmed.", [
        {
          text: "OK",
          onPress: () => {
            setDonatingItem(null)
            setModalVisible(false)
            fetchPendingRequests() // Refresh the list
          },
        },
      ])
    } catch (error) {
      console.error("Error confirming donation:", error)
      Alert.alert("Error", "Failed to confirm donation. Please try again.")
      setDonatingItem(null)
    }
  }

  const handleGoBack = () => {
    router.replace("/(tabsRecipient)")
  }

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const CategoryIcon = getCategoryIcon(item.category)
    const categoryColor = getCategoryColor(item.category)

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestCardHeader}>
          <View style={styles.requestTypeContainer}>
            <View style={[styles.categoryIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <CategoryIcon width={20} height={20} color={categoryColor} />
            </View>
            <View>
              <Text style={styles.requestName}>{item.name}</Text>
              <Text style={styles.requestCategory}>{item.category}</Text>
            </View>
          </View>

          {item.timestamp && (
            <View style={styles.requestTimeContainer}>
              <Clock width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.requestTime}>{formatDate(item.timestamp)}</Text>
            </View>
          )}
        </View>

        <View style={styles.requestCardBody}>
          <Text style={styles.requestDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.requestRequester}>
            <User width={14} height={14} color={THEME.textMuted} />
            <Text style={styles.requestRequesterText}>Requested by: {item.requester}</Text>
          </View>
        </View>

        <View style={styles.requestCardFooter}>
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleViewDetails(item)}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ChevronRight width={16} height={16} color={THEME.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => handleDonate(item.id)}
            disabled={donatingItem === item.id}
          >
            {donatingItem === item.id ? (
              <ActivityIndicator size="small" color={THEME.textLight} />
            ) : (
              <>
                <Heart width={16} height={16} color={THEME.textLight} />
                <Text style={styles.donateButtonText}>Donate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0B5351", "#092327"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Heart width={24} height={24} color={THEME.textLight} />
            <Text style={styles.headerTitle}>Donation Requests</Text>
          </View>
          <Text style={styles.headerSubtitle}>Help fulfill needs from recipients</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeaderTitle}>Pending Donation Requests</Text>
          <Text style={styles.listHeaderSubtitle}>Showing {wishlistItems.length} requests waiting for your help</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Loading donation requests...</Text>
          </View>
        ) : (
          <FlatList
            data={wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.requestsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AlertTriangle width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No pending requests</Text>
                <Text style={styles.emptyStateSubtext}>
                  All donation requests have been fulfilled. Check back later!
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Details Modal - Updated to slide from bottom */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Donation Request Details</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalScrollContent}>
                {/* Request Details */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Request Information</Text>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <ShoppingBag width={18} height={18} color={THEME.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Item Requested</Text>
                      <Text style={styles.detailValue}>{selectedItem.name}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Calendar width={18} height={18} color={THEME.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{selectedItem.category}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <User width={18} height={18} color={THEME.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Requested By</Text>
                      <Text style={styles.detailValue}>{selectedItem.requester}</Text>
                    </View>
                  </View>

                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description</Text>
                    <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                  </View>
                </View>

                {/* Recipient Organization Details */}
                {recipientInfo && recipientInfo.organizationDetails && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Recipient Organization</Text>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Home width={18} height={18} color={THEME.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Organization Name</Text>
                        <Text style={styles.detailValue}>
                          {recipientInfo.organizationDetails.name || "Not specified"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <ShoppingCart width={18} height={18} color={THEME.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Organization Type</Text>
                        <Text style={styles.detailValue}>
                          {recipientInfo.organizationDetails.type || "Not specified"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <MapPin width={18} height={18} color={THEME.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>
                          {recipientInfo.organizationDetails.address || "No address provided"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Phone width={18} height={18} color={THEME.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Contact</Text>
                        <Text style={styles.detailValue}>
                          {recipientInfo.organizationDetails.contact || "No contact provided"}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Donate Button */}
                <TouchableOpacity
                  style={styles.modalDonateButton}
                  onPress={() => {
                    setModalVisible(false)
                    handleDonate(selectedItem.id)
                  }}
                  disabled={donatingItem === selectedItem.id}
                >
                  {donatingItem === selectedItem.id ? (
                    <ActivityIndicator size="small" color={THEME.textLight} />
                  ) : (
                    <LinearGradient
                      colors={["#0B5351", "#092327"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.donateButtonGradient}
                    >
                      <Heart width={20} height={20} color={THEME.textLight} />
                      <Text style={styles.modalDonateButtonText}>Fulfill This Donation</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    marginBottom: 30,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 14, // Make space for the back button
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textLight,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 14,
    marginBottom: 16,
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
  listHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
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
  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  requestCard: {
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
  requestCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  requestTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  requestCategory: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  requestTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestTime: {
    fontSize: 12,
    color: THEME.textMuted,
    marginLeft: 4,
  },
  requestCardBody: {
    padding: 16,
  },
  requestDescription: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestRequester: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  requestRequesterText: {
    fontSize: 13,
    color: THEME.textMuted,
    marginLeft: 6,
    fontStyle: "italic",
  },
  requestCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
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
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: THEME.primary,
    borderRadius: 8,
    minWidth: 100,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textLight,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
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

  // Updated Modal styles to match food.tsx bottom sheet style
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Changed to align at bottom
  },
  modalContent: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "80%", // Limit height to 80% of screen
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(31, 105, 105, 0.1)",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: THEME.text,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
  },
  modalDonateButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  donateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modalDonateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
    marginLeft: 8,
  },
})

export default RequestedDonations


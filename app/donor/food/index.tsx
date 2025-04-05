"use client"

import { useState, useEffect } from "react"
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
  Modal,
  ActivityIndicator,
} from "react-native"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { ArrowLeft, Minus, Plus, ChevronDown, MapPin, Phone, Home } from "react-native-feather"
import { useRouter } from "expo-router"
import { collection, addDoc,getDocs, query, where, Timestamp } from "firebase/firestore";
import { database } from "../../../config/FirebaseConfig";
import { getLocalStorage } from "@/service/Storage"

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
}

// Food items data
const foodItems = [
  {
    id: "rice",
    name: "Rice",
    price: 120,
    image: "https://cdn-icons-png.flaticon.com/128/9873/9873609.png",
    unit: "kg",
  },
  {
    id: "dal",
    name: "Dal",
    price: 200,
    image: "https://cdn-icons-png.flaticon.com/512/2276/2276931.png",
    unit: "kg",
  },
  {
    id: "oil",
    name: "Oil",
    price: 152,
    image: "https://cdn-icons-png.flaticon.com/128/5037/5037447.png",
    unit: "pack",
  },
  {
    id: "milk",
    name: "Milk",
    price: 60,
    image: "https://cdn-icons-png.flaticon.com/512/2674/2674486.png",
    unit: "liter",
  },
  {
    id: "flour",
    name: "Flour",
    price: 40,
    image: "https://cdn-icons-png.flaticon.com/128/4252/4252935.png",
    unit: "kg",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    price: 70,
    image: "https://cdn-icons-png.flaticon.com/512/2153/2153786.png",
    unit: "kg",
  },
]

// Payment methods
const paymentMethods = [
  {
    id: "wallet",
    name: "Digital Wallet",
    icon: "https://cdn-icons-png.flaticon.com/128/584/584026.png",
  },
  {
    id: "credit",
    name: "Credit Card",
    icon: "https://cdn-icons-png.flaticon.com/128/1198/1198299.png",
  },
  {
    id: "upi",
    name: "UPI",
    icon: "https://cdn-icons-png.flaticon.com/128/3080/3080729.png",
  },
]

interface FoodItem {
  id: string
  name: string
  price: number
  image: string
  unit: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
}

interface SelectedItems {
  [key: string]: number
}

interface Recipient {
  uid: string
  displayName: string
  organizationDetails: {
    type: string
    name: string
    address: string
    contact: string
  }
}

export default function Food() {
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({})
  const [totalAmount, setTotalAmount] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState("credit")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

  useEffect(() => {
    // Initialize selected items with 0 quantity
    const initialItems: { [key: string]: number } = {}
    foodItems.forEach((item) => {
      initialItems[item.id] = 0
    })
    setSelectedItems(initialItems)

    // Fetch recipients from Firebase
    fetchRecipients()
  }, [])

  useEffect(() => {
    // Calculate total amount whenever selected items change
    let total = 0
    Object.keys(selectedItems).forEach((itemId) => {
      const item = foodItems.find((food) => food.id === itemId)
      if (item) {
        total += item.price * selectedItems[itemId]
      }
    })
    setTotalAmount(total)
  }, [selectedItems])

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true)
      const recipientsQuery = query(collection(database, "users"), where("category", "==", "recipient"))

      const querySnapshot = await getDocs(recipientsQuery)
      const recipientsList: Recipient[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.organizationDetails) {
          recipientsList.push({
            uid: doc.id,
            displayName: data.displayName || "",
            organizationDetails: {
              type: data.organizationDetails.type || "",
              name: data.organizationDetails.name || "",
              address: data.organizationDetails.address || "",
              contact: data.organizationDetails.contact || "",
            },
          })
        }
      })

      setRecipients(recipientsList)
    } catch (error) {
      console.error("Error fetching recipients:", error)
      Alert.alert("Error", "Failed to load recipient organizations")
    } finally {
      setLoadingRecipients(false)
    }
  }

  const handleQuantityChange = (itemId: string, change: number) => {
    setSelectedItems((prev: SelectedItems) => {
      const newQuantity = Math.max(0, (prev[itemId] || 0) + change)
      return {
        ...prev,
        [itemId]: newQuantity,
      }
    })
  }

  const handleCheckout = async () => {
    // Check if any items are selected
    const hasItems = Object.values(selectedItems).some((quantity) => quantity > 0)

    if (!hasItems) {
      Alert.alert("No items selected", "Please select at least one food item to donate.")
      return
    }

    // Check if recipient is selected
    if (!selectedRecipient) {
      Alert.alert("No recipient selected", "Please select an organization to donate to.")
      return
    }

    Alert.alert(
      "Confirm Donation",
      `You're about to donate food worth ₹${totalAmount.toFixed(2)} to ${selectedRecipient.organizationDetails.name}. Proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // Prepare order data
              const userInfo = await getLocalStorage("userDetail")
              const userId = userInfo?.uid || userInfo?.id

            if (!userId) {
              Alert.alert("Error", "User ID not found. Please log in again.");
              return;
            }
            const orderData = {
              Category : "Food",
              items: Object.entries(selectedItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([id, quantity]) => {
                  const item = foodItems.find((food) => food.id === id);
                  return item ? { id, name: item.name, quantity, price: item.price } : null;
                })
                .filter(Boolean), // Remove null values
              totalAmount,
              paymentMethod: selectedPayment,
              timestamp: Timestamp.now(),
              donorId: userId,

            };

              // Store in Firebase Firestore
              await addDoc(collection(database, "Food Donations"), orderData)

              Alert.alert("Thank you!", "Your donation has been recorded successfully.", [
                {
                  text: "OK",
                  onPress: () => router.replace("/donor"),
                },
              ])
            } catch (error) {
              console.error("Error storing order:", error)
              Alert.alert("Error", "Something went wrong. Please try again.")
            }
          },
        },
      ],
    )
  }

  const getOrganizationTypeIcon = (type: string) => {
    switch (type) {
      case "Old Age Home":
        return <Home width={16} height={16} color={THEME.textMuted} />
      case "Orphanage":
        return <Home width={16} height={16} color={THEME.textMuted} />
      case "NGO":
        return <Home width={16} height={16} color={THEME.textMuted} />
      default:
        return <Home width={16} height={16} color={THEME.textMuted} />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* Header */}
      <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/donor")}>
          <ArrowLeft width={24} height={24} color={THEME.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Food Donation</Text>
          <Text style={styles.headerSubtitle}>Select items to donate</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Items Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Food Items</Text>

          <View style={styles.foodItemsContainer}>
            {foodItems.map((item) => (
              <View key={item.id} style={styles.foodItemCard}>
                <View style={styles.foodItemImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.foodItemImage} contentFit="contain" />
                </View>
                <View style={styles.foodItemDetails}>
                  <Text style={styles.foodItemName}>{item.name}</Text>
                  <Text style={styles.foodItemPrice}>
                    ₹{item.price.toFixed(2)} per {item.unit}
                  </Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[styles.quantityButton, selectedItems[item.id] === 0 && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(item.id, -1)}
                    disabled={selectedItems[item.id] === 0}
                  >
                    <Minus
                      width={16}
                      height={16}
                      color={selectedItems[item.id] === 0 ? THEME.textMuted : THEME.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{selectedItems[item.id] || 0}</Text>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item.id, 1)}>
                    <Plus width={16} height={16} color={THEME.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Select Organization Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Organization</Text>

          {loadingRecipients ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={THEME.primary} />
              <Text style={styles.loadingText}>Loading organizations...</Text>
            </View>
          ) : recipients.length === 0 ? (
            <View style={styles.noRecipientsContainer}>
              <Text style={styles.noRecipientsText}>No recipient organizations found</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.recipientSelector} onPress={() => setShowRecipientDropdown(true)}>
              {selectedRecipient ? (
                <View style={styles.selectedRecipientContainer}>
                  <View style={styles.selectedRecipientHeader}>
                    <View style={styles.selectedRecipientNameContainer}>
                      <Text style={styles.selectedRecipientName}>{selectedRecipient.organizationDetails.name}</Text>
                      <View style={styles.recipientTypeBadge}>
                        <Text style={styles.recipientTypeBadgeText}>{selectedRecipient.organizationDetails.type}</Text>
                      </View>
                    </View>
                    <ChevronDown width={20} height={20} color={THEME.textMuted} />
                  </View>

                  <View style={styles.recipientDetailsContainer}>
                    <View style={styles.recipientDetailRow}>
                      <MapPin width={14} height={14} color={THEME.textMuted} />
                      <Text style={styles.recipientDetailText}>{selectedRecipient.organizationDetails.address}</Text>
                    </View>
                    <View style={styles.recipientDetailRow}>
                      <Phone width={14} height={14} color={THEME.textMuted} />
                      <Text style={styles.recipientDetailText}>{selectedRecipient.organizationDetails.contact}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.selectRecipientPlaceholder}>
                  <Text style={styles.selectRecipientPlaceholderText}>Select an organization to donate to</Text>
                  <ChevronDown width={20} height={20} color={THEME.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentMethodCard, selectedPayment === method.id && styles.paymentMethodCardSelected]}
                  onPress={() => setSelectedPayment(method.id)}
                >
                  <View
                    style={[
                      styles.paymentMethodIconContainer,
                      selectedPayment === method.id && styles.paymentMethodIconContainerSelected,
                    ]}
                  >
                    <Image source={{ uri: method.icon }} style={styles.foodItemImage} contentFit="contain" />
                  </View>
                  <Text
                    style={[
                      styles.paymentMethodName,
                      selectedPayment === method.id && styles.paymentMethodNameSelected,
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>
              {Object.values(selectedItems).reduce((sum, quantity) => sum + quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <BlurView intensity={80} tint="light" style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, (!selectedRecipient || totalAmount === 0) && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={!selectedRecipient || totalAmount === 0}
        >
          <LinearGradient
            colors={!selectedRecipient || totalAmount === 0 ? ["#ccc", "#999"] : ["#0B5351", "#092327"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButtonGradient}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      {/* Recipients Selection Modal */}
      <Modal
        visible={showRecipientDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRecipientDropdown(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Organization</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowRecipientDropdown(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.recipientsList}>
              {recipients.map((recipient) => (
                <TouchableOpacity
                  key={recipient.uid}
                  style={styles.recipientCard}
                  onPress={() => {
                    setSelectedRecipient(recipient)
                    setShowRecipientDropdown(false)
                  }}
                >
                  <View style={styles.recipientCardHeader}>
                    <Text style={styles.recipientCardName}>{recipient.organizationDetails.name}</Text>
                    <View style={styles.recipientCardTypeBadge}>
                      <Text style={styles.recipientCardTypeBadgeText}>{recipient.organizationDetails.type}</Text>
                    </View>
                  </View>

                  <View style={styles.recipientCardDetails}>
                    <View style={styles.recipientCardDetailRow}>
                      <MapPin width={14} height={14} color={THEME.textMuted} />
                      <Text style={styles.recipientCardDetailText}>{recipient.organizationDetails.address}</Text>
                    </View>
                    <View style={styles.recipientCardDetailRow}>
                      <Phone width={14} height={14} color={THEME.textMuted} />
                      <Text style={styles.recipientCardDetailText}>{recipient.organizationDetails.contact}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    marginLeft: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "poppins-bold",
    color: THEME.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    fontFamily: "poppins",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginBottom: 16,
  },
  foodItemsContainer: {
    gap: 12,
  },
  foodItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodItemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  foodItemImage: {
    width: 30,
    height: 30,
  },
  foodItemDetails: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 14,
    fontFamily: "poppins-bold",
    color: THEME.text,
  },
  foodItemPrice: {
    fontSize: 13,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 105, 105, 0.05)",
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.text,
    width: 30,
    textAlign: "center",
  },
  // Recipient selector styles
  loadingContainer: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
  },
  noRecipientsContainer: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noRecipientsText: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
  },
  recipientSelector: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectRecipientPlaceholder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectRecipientPlaceholderText: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
  },
  selectedRecipientContainer: {
    width: "100%",
  },
  selectedRecipientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  selectedRecipientNameContainer: {
    flex: 1,
  },
  selectedRecipientName: {
    fontSize: 16,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginBottom: 4,
  },
  recipientTypeBadge: {
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  recipientTypeBadgeText: {
    fontSize: 12,
    fontFamily: "poppins-medium",
    color: THEME.primary,
  },
  recipientDetailsContainer: {
    marginTop: 4,
  },
  recipientDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  recipientDetailText: {
    fontSize: 13,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
    marginLeft: 8,
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "80%",
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
    fontFamily: "poppins-bold",
    color: THEME.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.primary,
  },
  recipientsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "70%",
  },
  recipientCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipientCardHeader: {
    marginBottom: 10,
  },
  recipientCardName: {
    fontSize: 16,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginBottom: 4,
  },
  recipientCardTypeBadge: {
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  recipientCardTypeBadgeText: {
    fontSize: 12,
    fontFamily: "poppins-medium",
    color: THEME.primary,
  },
  recipientCardDetails: {
    marginTop: 4,
  },
  recipientCardDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  recipientCardDetailText: {
    fontSize: 13,
    fontFamily: "poppins-medium",
    color: THEME.text,
    marginLeft: 8,
    flex: 1,
  },
  // Payment method styles
  paymentMethodsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodCardSelected: {
    borderColor: THEME.primary,
  },
  paymentMethodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentMethodIconContainerSelected: {
    backgroundColor: THEME.primary,
  },
  paymentMethodName: {
    fontSize: 12,
    fontFamily: "poppins-medium",
    color: THEME.text,
    textAlign: "center",
  },
  paymentMethodNameSelected: {
    color: THEME.primary,
    fontFamily: "poppins-bold",
  },
  summaryContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "poppins-medium",
    color: THEME.text,
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonDisabled: {
    opacity: 0.8,
  },
  checkoutButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    fontSize: 15,
    color: THEME.textLight,
    fontFamily: "poppins-medium",
  },
})


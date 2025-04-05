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
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native"
import { ArrowLeft, Minus, Plus, ChevronDown, MapPin, Phone, Home } from "react-native-feather"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"

import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"
import { database } from "../../../config/FirebaseConfig";
import QRCode from "react-native-qrcode-svg"
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

interface amountItem {
    id: string;
    name: string;
    price: number;
    image: string;
    unit: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
}

interface SelectedItems {
    [key: string]: number;
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
export default function Money() {
  const router = useRouter()
  const [amount, setAmount] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState("credit")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

  useEffect(() => {
    // Fetch recipients from Firebase
    fetchRecipients()
  }, [])

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

  const validateCardDetails = () => {
    const cardRegex = /^\d{16}$/
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    const cvvRegex = /^\d{3}$/

    if (!cardRegex.test(cardNumber)) {
      Alert.alert("Invalid Card", "Card number must be 16 digits.")
      return false
    }
    if (!expiryRegex.test(expiryDate)) {
      Alert.alert("Invalid Expiry Date", "Expiry date must be in MM/YY format.")
      return false
    }
    if (!cvvRegex.test(cvv)) {
      Alert.alert("Invalid CVV", "CVV must be 3 digits.")
      return false
    }
    return true
  }


  const handleCheckout = async () => {
    // Check if amount is greater than zero
    if (amount <= 0) {
      Alert.alert("Amount cannot be zero", "Please select at least one rupee to donate.")
      return
    }
    
    // Check if recipient is selected
    if (!selectedRecipient) {
      Alert.alert("No recipient selected", "Please select an organization to donate to.")
      return
    }

    Alert.alert(
      "Confirm Donation",
      `You're about to donate ₹${amount.toFixed(2)} using ${selectedPayment} to ${selectedRecipient.organizationDetails.name}. Proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // Prepare donation data

              const userInfo = await getLocalStorage("userDetail");
                const userId = userInfo?.uid || userInfo?.id;

                if (!userId) {
                  Alert.alert("Error", "User ID not found. Please log in again.");
                  return;
                }
              const donationData = {
                Category : "Money",
                amount,
                paymentMethod: selectedPayment,
                timestamp: new Date().toISOString(),
                donorId : userId,
                recipientId: selectedRecipient.uid,
                recipientName: selectedRecipient.organizationDetails.name,
                recipientType: selectedRecipient.organizationDetails.type,
              }
  
              // Store donation in Firestore
              await addDoc(collection(database, "Monetary Donations"), donationData)
  
              Alert.alert("Thank you!", "Your donation has been processed successfully.", [
                {
                  text: "OK",
                  onPress: () => router.replace("/donor"),
                },
              ])

            } catch (error) {
              console.error("Error processing donation:", error)
              Alert.alert("Error", "Something went wrong. Please try again.")
            }
          },
        },
      ]
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
  
  
  const upiId = "KindNest@upi" // Replace with actual UPI ID
  const upiQrData = `upi://pay?pa=${upiId}&pn=KindNest&am=${amount}&cu=INR`
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* Header */}
      <LinearGradient
        colors={["#0B5351", "#092327"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/donor")}>
          <ArrowLeft width={24} height={24} color={THEME.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Donate Money</Text>
          <Text style={styles.headerSubtitle}>Transform Lives with Your Financial Support</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Donation Amount</Text>
          
          <View style={styles.amountItemCard}>
            <View style={styles.amountItemImageContainer}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/9382/9382295.png" }} style={styles.amountItemImage} contentFit="contain" />
            </View>
            <View style={styles.amountItemDetails}>
              <Text style={styles.amountItemPrice}>Enter amount you want to donate :</Text>
              <View style={styles.quantityControl}>
                <Text style={styles.amountItemName}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  onChangeText={(text) => setAmount(parseFloat(text))}
                  value={amount}
                  keyboardType="numeric"
                />
              </View>
            </View>
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
                    <Image source={{ uri: method.icon }} style={styles.amountItemImage} contentFit="contain" />
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
        {/* Show QR Code for UPI Payment */}
        {selectedPayment === "upi" && amount > 0 && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Scan this QR Code to Pay via UPI</Text>
            <QRCode value={upiQrData} size={200} />
          </View>
        )}

        {/* Show Credit Card Input Fields if Credit Card is Selected */}
        {selectedPayment === "credit" && (
          <View style={styles.creditCardContainer}>
            <Text style={styles.creditCardTitle}>Enter Card Details</Text>
            <TextInput
              style={styles.cardInput}
              onChangeText={setCardNumber}
              value={cardNumber}
              keyboardType="numeric"
              placeholder="Card Number (16 digits)"
              maxLength={16}
            />
            <TextInput
              style={styles.cardInput}
              onChangeText={setExpiryDate}
              value={expiryDate}
              keyboardType="numeric"
              placeholder="Expiry Date (MM/YY)"
              maxLength={5}
            />
            <TextInput
              style={styles.cardInput}
              onChangeText={setCvv}
              value={cvv}
              keyboardType="numeric"
              placeholder="CVV (3 digits)"
              maxLength={3}
              secureTextEntry
            />
          </View>
        )}


        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>₹{amount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <BlurView intensity={80} tint="light" style={styles.checkoutContainer}>
        <TouchableOpacity
                  style={[styles.checkoutButton, (!selectedRecipient || amount === 0) && styles.checkoutButtonDisabled]}
                  onPress={handleCheckout}
                  disabled={!selectedRecipient || amount === 0}
                >
                  <LinearGradient
                    colors={!selectedRecipient || amount === 0 ? ["#ccc", "#999"] : ["#0B5351", "#092327"]}
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
    marginLeft: 16,
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
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginBottom: 16,
  },
  amountInput: { 
    height: 50, 
    width: "60%",
    borderBottomColor: THEME.primaryDark, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom:1,
    marginBottom:4,
    backgroundColor: THEME.card,
    borderBottomWidth:1,
    fontSize: 22,
    fontFamily: "poppins-bold",
  },
  amountItemsContainer: {
    gap: 12,
  },
  amountItemCard: {
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
  amountItemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  amountItemImage: {
    width: 40,
    height: 40,
    // tintColor: THEME.primary,
  },
  amountItemDetails: {
    flex: 1,
  },
  amountItemName: {
    fontSize: 22,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginTop:3,
  },
  amountItemPrice: {
    fontSize: 12,
    fontFamily: "poppins-medium",
    color: THEME.textMuted,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: THEME.card,

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
  qrContainer: { alignItems: "center", marginTop: 20 },
  qrTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  creditCardContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: THEME.card,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  creditCardTitle: {
    fontSize: 16,
    fontFamily: "poppins-bold",
    color: THEME.text,
    marginBottom: 12,
  },
  cardInput: {
    height: 50,
    borderColor: THEME.primaryDark,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "poppins-medium",
    backgroundColor: THEME.card,
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


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
  FlatList,
} from "react-native"
import {ChevronDown, Phone, Home } from "react-native-feather"

import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import {
  ArrowLeft,
  Minus,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Check,
  ChevronLeft,
  ChevronRight,
} from "react-native-feather"
import { useRouter } from "expo-router"
import { database } from "../../../config/FirebaseConfig";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import axios from "axios";
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
  inputBorder: "#e0e0e0",
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

const clothingItems = [
  {
    id: "men",
    name: "Men's Clothing",
    image: "https://cdn-icons-png.flaticon.com/128/2331/2331716.png",
    unit: "piece",
  },
  {
    id: "women",
    name: "Womens's Clothing",
    image: "https://cdn-icons-png.flaticon.com/128/4378/4378432.png",
    unit: "piece",
  },
  {
    id: "children",
    name: "Children's Clothing",
    image: "https://cdn-icons-png.flaticon.com/128/9752/9752768.png",
    unit: "piece",
  },
  {
    id: "winter",
    name: "Winter wear",
    image: "https://cdn-icons-png.flaticon.com/128/1926/1926322.png",
    unit: "pair",
  },
  {
    id: "traditional",
    name: "Traditional and festive wear ",
    image: "https://cdn-icons-png.flaticon.com/128/17206/17206061.png",
    unit: "piece",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://cdn-icons-png.flaticon.com/128/2161/2161101.png",
    unit: "piece",
  },
]

// Time slots
const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
]

interface SelectedItems {
  [key: string]: number
}

export default function ClothesCategoryScreen() {
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({})
  const [totalItems, setTotalItems] = useState(0)

  // Location states
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropAddress, setDropAddress] = useState("")

  // Schedule states
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

  const fetchLocations = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
  
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: text,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "IN", 
        },
        headers: {
          // Required headers for Nominatim usage policy
          "User-Agent": "Your-App-Name/1.0 (your@email.com)",
          "Referer": "https://yourdomain.com",
          "Accept-Language": "en-US,en;q=0.9",
        }
      });
      
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching locations: ", error);
      Alert.alert("Error", "Could not fetch locations. Please try again later.");
    }
  };

  const handleSelectLocation = (location: any) => {
    setSearchQuery(location.display_name);
    setPickupAddress(location.display_name);
    setSuggestions([]);
  };
  

    // Helper functions for date handling
    const isToday = (date: Date): boolean => {
      const today = new Date()
      return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
      )
    }
  
    interface Day {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isToday?: boolean;
      isPast?: boolean;
      date: Date;
    }

    const isPastDay = (date: Date): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    };
  
    interface ChangeMonthParams {
      increment: number;
    }

    const changeMonth = (increment: ChangeMonthParams['increment']): void => {
      const newDate = new Date(currentYear, currentMonth + increment, 1)
      setCurrentMonth(newDate.getMonth())
      setCurrentYear(newDate.getFullYear())
      setCalendarDays(generateCalendarDays(newDate))
    }
  
    interface FormatMonthYearParams {
      month: number;
      year: number;
    }

    const formatMonthYear = (month: FormatMonthYearParams['month'], year: FormatMonthYearParams['year']): string => {
      const monthNames: string[] = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      ]
      return `${monthNames[month]} ${year}`
    }

  // Generate calendar days
  interface CalendarDay {
    day: number
    month: number
    year: number
    isCurrentMonth: boolean
    isToday?: boolean
    isPast?: boolean
    date: Date
  }

  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days: CalendarDay[] = []

    // Add previous month days to fill the first week
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      })
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: isToday(date),
        isPast: isPastDay(date),
        date,
      })
    }

    // Add next month days to complete the last week
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          month: month + 1,
          year,
          isCurrentMonth: false,
          date: new Date(year, month + 1, i),
        })
      }
    }

    return days
  }

  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(selectedDate))
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())

  useEffect(() => {
    // Initialize selected items with 0 quantity
    const initialItems: { [key: string]: number } = {}
    clothingItems.forEach((item) => {
      initialItems[item.id] = 0
    })
    setSelectedItems(initialItems)

    // Fetch recipients from Firebase
    fetchRecipients()
  }, [])

  useEffect(() => {
    // Calculate total items whenever selected items change
    let total = 0
    Object.keys(selectedItems).forEach((itemId) => {
      total += selectedItems[itemId]
    })
    setTotalItems(total)
  }, [selectedItems])

  interface QuantityChangeParams {
    itemId: string;
    change: number;
  }

  const handleQuantityChange = (itemId: QuantityChangeParams['itemId'], change: QuantityChangeParams['change']): void => {
    setSelectedItems((prev: { [key: string]: number }) => {
      const newQuantity: number = Math.max(0, (prev[itemId] || 0) + change);
      return {
        ...prev,
        [itemId]: newQuantity,
      };
    });
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast) return
    setSelectedDate(day.date)
    setShowDatePicker(false)
  }
  

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  const validateForm = () => {
    // Check if any items are selected
    if (totalItems === 0) {
      Alert.alert("No items selected", "Please select at least one clothing item to donate.")
      return false
    }

    // Check if pickup address is provided
    if (!pickupAddress.trim()) {
      Alert.alert("Missing information", "Please provide a pickup address.")
      return false
    }

    // Check if time slot is selected
    if (!selectedTimeSlot) {
      Alert.alert("Missing information", "Please select a time slot for pickup.")
      return false
    }
    // Check if recipient is selected
    if (!selectedRecipient) {
      Alert.alert("No recipient selected", "Please select an organization to donate to.")
      return false
    }
    return true
  }

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

  const handleScheduleDonation = async () => {

    if (validateForm()) {
      Alert.alert(
        "Confirm Donation",
        `You're about to schedule a donation of ${totalItems} clothing items for ${formatDate(selectedDate)} at ${selectedTimeSlot}. Proceed?`,
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
                  Category : "Clothes",
                  items: Object.entries(selectedItems)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([id, quantity]) => {
                      const item = clothingItems.find((clothing) => clothing.id === id)
                      return item ? { id, name: item.name, quantity } : null
                    })
                    .filter(Boolean), // Remove null values
                  totalItems,
                  pickupAddress,
                  dropAddress: dropAddress || "Not specified",
                  selectedDate: selectedDate.toISOString(),
                  selectedTimeSlot,
                  timestamp: Timestamp.now(),
                  donorId : userId,
                  recipientId: selectedRecipient?.uid || "",
                  recipientName: selectedRecipient?.organizationDetails?.name || "",
                  recipientType: selectedRecipient?.organizationDetails?.type || "",
                }
  
                // Store donation in Firestore
                await addDoc(collection(database, "Clothing Donations"), donationData)
  
                Alert.alert("Thank you!", "Your clothing donation has been scheduled successfully.", [
                  {
                    text: "OK",
                    onPress: () => router.replace("/donor"),
                  },
                ])
              } catch (error) {
                console.error("Error storing donation:", error)
                Alert.alert("Error", "Something went wrong. Please try again.")
              }
            },
          },
        ]
      )
    }
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
          <Text style={styles.headerTitle}>Clothes Donation</Text>
          <Text style={styles.headerSubtitle}>Select items and schedule pickup</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clothing Items Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Clothing Items</Text>

          <View style={styles.clothingItemsContainer}>
            {clothingItems.map((item) => (
              <View key={item.id} style={styles.clothingItemCard}>
                <View style={styles.clothingItemImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.clothingItemImage} contentFit="contain" />
                </View>
                <View style={styles.clothingItemDetails}>
                  <Text style={styles.clothingItemName}>{item.name}</Text>
                  <Text style={styles.clothingItemUnit}>{item.unit}</Text>
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

        {/* Location Section */}
        <View style={[styles.sectionContainer, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Pickup & Drop Locations</Text>

          <View style={styles.locationContainer}>
            {/* Pickup Address */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationIconContainer}>
                <MapPin width={20} height={20} color={THEME.primary} />
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter pickup address"
                value={searchQuery}
                onChangeText={fetchLocations}
                placeholderTextColor={THEME.textMuted}
              />
            </View>


            {suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestion} 
                    onPress={() => handleSelectLocation(item)}
                  >
                    <Text style={styles.suggestionText}>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
              />
            )}

            {/* Drop Address (Optional) */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationIconContainer}>
                <Navigation width={20} height={20} color={THEME.primary} />
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter drop location (optional)"
                value={dropAddress}
                onChangeText={setDropAddress}
                placeholderTextColor={THEME.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={[styles.sectionContainer, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Schedule Pickup</Text>

          <View style={styles.scheduleContainer}>
            {/* Date Picker Button */}
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <View style={styles.datePickerIconContainer}>
                <Calendar width={20} height={20} color={THEME.primary} />
              </View>
              <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            {/* Time Slots */}
            <Text style={styles.timeSlotLabel}>Select a time slot:</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlotButton, selectedTimeSlot === slot && styles.timeSlotButtonSelected]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <View style={styles.timeSlotContent}>
                    <Clock width={16} height={16} color={selectedTimeSlot === slot ? THEME.textLight : THEME.primary} />
                    <Text style={[styles.timeSlotText, selectedTimeSlot === slot && styles.timeSlotTextSelected]}>
                      {slot}
                    </Text>
                  </View>
                  {selectedTimeSlot === slot && (
                    <View style={styles.timeSlotCheckContainer}>
                      <Check width={14} height={14} color={THEME.textLight} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Summary Section */}
        <View style={[styles.summaryContainer, { marginTop: 30, marginBottom: 20 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup Date:</Text>
            <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
          </View>
          {selectedTimeSlot && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Time:</Text>
              <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <ChevronLeft width={24} height={24} color={THEME.primary} />
              </TouchableOpacity>
              <Text style={styles.datePickerMonthYear}>{formatMonthYear(currentMonth, currentYear)}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <ChevronRight width={24} height={24} color={THEME.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysContainer}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                const isSelected =
                  selectedDate.getDate() === day.day &&
                  selectedDate.getMonth() === day.month &&
                  selectedDate.getFullYear() === day.year

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayOtherMonth,
                      day.isPast && styles.calendarDayPast,
                      isSelected && styles.calendarDaySelected,
                      day.isToday && styles.calendarDayToday,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={day.isPast}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                        day.isPast && styles.calendarDayTextPast,
                        isSelected && styles.calendarDayTextSelected,
                        day.isToday && styles.calendarDayTextToday,
                      ]}
                    >
                      {day.day}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={styles.datePickerActions}>
              <TouchableOpacity style={styles.datePickerCancelButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerConfirmButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Button */}
      <BlurView intensity={80} tint="light" style={styles.scheduleButtonContainer}>
        <TouchableOpacity
                  style={[styles.checkoutButton, (!selectedRecipient || totalItems === 0) && styles.checkoutButtonDisabled]}
                  onPress={handleScheduleDonation}
                  disabled={!selectedRecipient || totalItems === 0}
                >
                  <LinearGradient
                    colors={!selectedRecipient || totalItems === 0 ? ["#ccc", "#999"] : ["#0B5351", "#092327"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scheduleButtonGradient}
          >
            <Text style={styles.scheduleButtonText}>Schedule Donation</Text>
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
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding to account for the fixed button at bottom
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 16,
  },
  clothingItemsContainer: {
    gap: 12,
  },
  clothingItemCard: {
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
  clothingItemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clothingItemImage: {
    width: 30,
    height: 30,
  },
  clothingItemDetails: {
    flex: 1,
  },
  clothingItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  clothingItemUnit: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    width: 30,
    textAlign: "center",
  },
  locationContainer: {
    gap: 12,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    height: 50,
    color: THEME.text,
    fontSize: 15,
  },
  scheduleContainer: {
    gap: 16,
  },
  datePickerButton: {
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
  datePickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "500",
  },
  timeSlotLabel: {
    fontSize: 15,
    color: THEME.text,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeSlotButtonSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  timeSlotContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: 15,
    color: THEME.text,
    marginLeft: 8,
  },
  timeSlotTextSelected: {
    color: THEME.textLight,
    fontWeight: "500",
  },
  timeSlotCheckContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleButtonContainer: {
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
  scheduleButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scheduleButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textLight,
  },

  // Custom Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerModal: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerMonthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
  },
  weekdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "500",
    color: THEME.textMuted,
    width: 36,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  calendarDay: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 18,
  },
  calendarDayOtherMonth: {
    opacity: 0.4,
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: THEME.primary,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  calendarDayText: {
    fontSize: 14,
    color: THEME.text,
  },
  calendarDayTextOtherMonth: {
    color: THEME.textMuted,
  },
  calendarDayTextPast: {
    color: THEME.textMuted,
  },
  calendarDayTextSelected: {
    color: THEME.textLight,
    fontWeight: "600",
  },
  calendarDayTextToday: {
    color: THEME.primary,
    fontWeight: "600",
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  datePickerCancelText: {
    color: THEME.textMuted,
    fontWeight: "500",
  },
  datePickerConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
  },
  datePickerConfirmText: {
    color: THEME.textLight,
    fontWeight: "500",
  },
  suggestionsList: {
    maxHeight: 150,
    backgroundColor: THEME.background,
    borderRadius: 8,
    marginTop: 4,
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.inputBorder,
  },
  suggestionText: {
    color: THEME.text,
    fontSize: 14,
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


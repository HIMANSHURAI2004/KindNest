import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ImageBackground,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { database as db } from "../../config/FirebaseConfig"
import AntDesign from "@expo/vector-icons/AntDesign"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, FileText, Heart } from "react-native-feather"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { getLocalStorage } from "@/service/Storage"

const { width } = Dimensions.get("window")

type Event = {
  id: string
  name: string
  contact: string
  eventType: string
  location: string
  attendees: number
  eventDate: string
  eventTime: string
  description?: string
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
  inputBorder: "#e0e0e0",
  gradientStart: "#1f6969",
  gradientEnd: "#184f4f",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
}

// Event types with icons and colors
const eventTypes = [
  {
    value: "Birthday Celebration",
    label: "Birthday Celebration",
    icon: "gift",
    color: "#04DC49",
  },
  {
    value: "Langar",
    label: "Langar (Food Distribution)",
    icon: "coffee",
    color: "#14CC60",
  },
  {
    value: "Charity Drive",
    label: "Charity Drive",
    icon: "heart",
    color: "#4CAF50",
  },
  {
    value: "Educational Session",
    label: "Educational Session",
    icon: "book",
    color: "#09A129",
  },
  {
    value: "Health Checkup Camp",
    label: "Health Checkup Camp",
    icon: "activity",
    color: "#09A129",
  },
]

// Locations with icons
const locations = [
  { value: "Old Age Home", label: "Old Age Home", icon: "home" },
  { value: "Orphanage", label: "Orphanage", icon: "users" },
  { value: "NGO", label: "NGO", icon: "briefcase" },
]

// Time slots
const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
]

// Get icon for event type
const getEventTypeIcon = (type: string) => {
  const eventType = eventTypes.find((et) => et.value === type)
  return eventType ? eventType.icon : "calendar"
}

// Get color for event type
const getEventTypeColor = (type: string) => {
  const eventType = eventTypes.find((et) => et.value === type)
  return eventType ? eventType.color : THEME.primary
}

const EventBooking = () => {
  const [name, setName] = useState<string>("")
  const [contact, setContact] = useState<string>("")
  const [eventType, setEventType] = useState<string>("Birthday Celebration")
  const [location, setLocation] = useState<string>("Old Age Home")
  const [attendees, setAttendees] = useState<string>("1")
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [events, setEvents] = useState<Event[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear())
  const [calendarDays, setCalendarDays] = useState<any[]>([])

  // Animation states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  // Helper functions for date handling
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPastDay = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Generate calendar days
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days = []

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

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentYear, currentMonth + increment, 1)
    setCurrentMonth(newDate.getMonth())
    setCurrentYear(newDate.getFullYear())
    setCalendarDays(generateCalendarDays(newDate))
  }

  const formatMonthYear = (month: number, year: number) => {
    const monthNames = [
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

  const handleDateSelect = (day: any) => {
    if (day.isPast) return
    setSelectedDate(day.date)
    setEventDate(day.date)
  }

  const confirmDateSelection = () => {
    setShowDatePicker(false)
  }

  useEffect(() => {
    // Initialize calendar days
    setCalendarDays(generateCalendarDays(selectedDate))
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventList: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Event, "id">),
      }))
      setEvents(eventList)
      
    })
    return () => unsubscribe()
  }, [])

  const [userId,setUserId] = useState(null);
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getLocalStorage("userDetail")
      const uid = userInfo?.uid || userInfo?.id || null
      setUserId(uid)
    }

    fetchUserInfo()
  })
  const handleSubmit = async () => {
    if (!name || !contact || !eventType || !location || !eventDate || !selectedTimeSlot) {
      Alert.alert("Missing Information", "Please fill in all required fields to book your event.")
      return
    }

    setLoading(true)
    
    try {
      const eventData = {
        donorId: userId,
        name,
        contact,
        eventType,
        location,
        attendees: Number(attendees),
        eventDate: eventDate.toISOString().split("T")[0],
        eventTime: selectedTimeSlot,
        description,
      }

      if (editingId) {
        const eventRef = doc(db, "events", editingId)
        await updateDoc(eventRef, eventData)
        setEditingId(null)
        Alert.alert("Success", "Your event has been updated successfully!")
      } else {
        await addDoc(collection(db, "events"), eventData)
        setShowSuccessMessage(true)
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      }

      // Reset fields after submission
      setName("")
      setContact("")
      setEventType("Birthday Celebration")
      setLocation("Old Age Home")
      setAttendees("1")
      setEventDate(null)
      setSelectedTimeSlot("")
      setDescription("")
    } catch (error) {
      Alert.alert("Error", "Failed to process event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingId(event.id)
    setName(event.name)
    setContact(event.contact)
    setEventType(event.eventType)
    setLocation(event.location)
    setAttendees(event.attendees.toString())

    // Parse the date string to Date object
    const dateObj = new Date(event.eventDate)
    setEventDate(dateObj)
    setSelectedDate(dateObj)

    // Set the time slot
    setSelectedTimeSlot(event.eventTime)

    setDescription(event.description || "")
  }

  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to cancel this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "events", id))
            Alert.alert("Success", "Event has been cancelled successfully.")
          } catch (error) {
            Alert.alert("Error", "Failed to cancel event. Please try again.")
          }
        },
        style: "destructive",
      },
    ])
  }

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventColor = getEventTypeColor(item.eventType)

    return (
      <View style={[styles.eventCard, { borderLeftColor: eventColor, borderLeftWidth: 4 }]}>
        <View style={styles.eventCardContent}>
          <View style={styles.eventCardHeader}>
            <View style={[styles.eventTypeTag, { backgroundColor: `${eventColor}20` }]}>
              <Text style={[styles.eventTypeText, { color: eventColor }]}>{item.eventType}</Text>
            </View>
            <View style={styles.eventCardActions}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
                <AntDesign name="edit" size={16} color={THEME.info} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <AntDesign name="delete" size={16} color={THEME.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.eventCardDetails}>
            <Text style={styles.eventCardName}>{item.name}</Text>
            <View style={styles.eventCardDetail}>
              <Calendar width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.eventCardDetailText}>{item.eventDate}</Text>
            </View>
            <View style={styles.eventCardDetail}>
              <Clock width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.eventCardDetailText}>{item.eventTime}</Text>
            </View>
            <View style={styles.eventCardDetail}>
              <MapPin width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.eventCardDetailText}>{item.location}</Text>
            </View>
            <View style={styles.eventCardDetail}>
              <Users width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.eventCardDetailText}>{item.attendees} attendees</Text>
            </View>
            {item.description && (
              <View style={styles.eventCardDescription}>
                <Text style={styles.eventCardDescriptionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
        <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Event Booking</Text>
            </View>
            <Text style={styles.headerSubtitle}>Celebrate special moments with those who need it most</Text>
          </View>
        <View style={styles.backgroundContainer}>
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View style={styles.formContainer}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Your Name</Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="user" size={20} color={THEME.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor={THEME.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact Number</Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="phone" size={20} color={THEME.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your contact number"
                        value={contact}
                        onChangeText={setContact}
                        keyboardType="phone-pad"
                        style={styles.input}
                        placeholderTextColor={THEME.textMuted}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Event Details</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Type</Text>
                    <View style={styles.pickerContainer}>
                      <AntDesign name="calendar" size={20} color={THEME.primary} style={styles.inputIcon} />
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={eventType}
                          onValueChange={setEventType}
                          style={styles.picker}
                          dropdownIconColor={THEME.primary}
                        >
                          {eventTypes.map((type) => (
                            <Picker.Item key={type.value} label={type.label} value={type.value} color={THEME.text} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Location</Text>
                    <View style={styles.pickerContainer}>
                      <AntDesign name="enviromento" size={20} color={THEME.primary} style={styles.inputIcon} />
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={location}
                          onValueChange={setLocation}
                          style={styles.picker}
                          dropdownIconColor={THEME.primary}
                        >
                          {locations.map((loc) => (
                            <Picker.Item key={loc.value} label={loc.label} value={loc.value} color={THEME.text} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Number of Attendees</Text>
                    <View style={styles.inputContainer}>
                      <AntDesign name="team" size={20} color={THEME.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="How many people will attend?"
                        value={attendees}
                        onChangeText={setAttendees}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor={THEME.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Date</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.datePickerIconContainer}>
                        <Calendar width={20} height={20} color={THEME.textLight} />
                      </View>
                      <Text style={styles.datePickerText}>
                        {eventDate ? formatDate(eventDate) : "Select a date for your event"}
                      </Text>
                      <AntDesign name="caretdown" size={12} color={THEME.textLight} style={styles.datePickerCaret} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Time</Text>
                    <Text style={styles.timeSlotLabel}>Select a convenient time slot:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.timeSlotScrollContainer}
                    >
                      {timeSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.timeSlotButton, selectedTimeSlot === slot && styles.timeSlotButtonSelected]}
                          onPress={() => setSelectedTimeSlot(slot)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.timeSlotContent}>
                            <Clock
                              width={16}
                              height={16}
                              color={selectedTimeSlot === slot ? THEME.textLight : THEME.primary}
                            />
                            <Text style={[styles.timeSlotText, selectedTimeSlot === slot && styles.timeSlotTextSelected]}>
                              {slot}
                            </Text>
                          </View>
                          {selectedTimeSlot === slot && (
                            <View style={styles.timeSlotCheckContainer}>
                              <AntDesign name="check" size={14} color={THEME.textLight} />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Additional Notes</Text>
                    <View style={styles.textAreaContainer}>
                      <FileText width={20} height={20} color={THEME.primary} style={styles.textAreaIcon} />
                      <TextInput
                        placeholder="Any special requests or details about your event?"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        placeholderTextColor={THEME.textMuted}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#0b5351", "#0b5351"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={THEME.textLight} />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>{editingId ? "Update Event" : "Book Your Event"}</Text>
                        <AntDesign name="arrowright" size={20} color={THEME.textLight} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              events.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <AntDesign name="calendar" size={50} color={THEME.textMuted} />
                  <Text style={styles.emptyStateText}>No events booked yet</Text>
                  <Text style={styles.emptyStateSubtext}>Your scheduled events will appear here</Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              events.length > 0 ? (
                <View style={styles.upcomingEventsHeader}>
                  <Text style={styles.upcomingEventsTitle}>Your Upcoming Events</Text>
                  <View style={styles.upcomingEventsDivider} />
                </View>
              ) : null
            }
            ListHeaderComponentStyle={styles.listHeaderStyle}
          />
        </View>

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successMessageContainer}>
          <BlurView intensity={90} tint="dark" style={styles.successMessageBlur}>
            <View style={styles.successMessageContent}>
              <View style={styles.successIconContainer}>
                <AntDesign name="checkcircle" size={40} color={THEME.success} />
              </View>
              <Text style={styles.successMessageTitle}>Event Booked!</Text>
              <Text style={styles.successMessageText}>Your event has been scheduled successfully.</Text>
            </View>
          </BlurView>
        </View>
      )}

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.datePickerHeader}>
              <TouchableOpacity style={styles.monthNavigationButton} onPress={() => changeMonth(-1)}>
                <ChevronLeft width={24} height={24} color={THEME.textLight} />
              </TouchableOpacity>
              <Text style={styles.datePickerMonthYear}>{formatMonthYear(currentMonth, currentYear)}</Text>
              <TouchableOpacity style={styles.monthNavigationButton} onPress={() => changeMonth(1)}>
                <ChevronRight width={24} height={24} color={THEME.textLight} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.calendarContainer}>
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
                    selectedDate &&
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
                      activeOpacity={day.isPast ? 1 : 0.6}
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
                      {day.isToday && <View style={styles.todayIndicator} />}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View style={styles.datePickerActions}>
              <TouchableOpacity style={styles.datePickerCancelButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.datePickerConfirmButton} onPress={confirmDateSelection}>
                <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.confirmButtonGradient}>
                  <Text style={styles.datePickerConfirmText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    marginBottom: 28,
  },
  backgroundContainer: {
    marginTop: 20,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 20 : 15,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  listContainer: {
    paddingBottom: 40,
  },
  listHeaderStyle: {
    zIndex: 10,
  },
  formContainer: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  formSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(31, 105, 105, 0.1)",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 8,
    color: THEME.text,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  textAreaContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
    alignItems: "flex-start",
  },
  textAreaIcon: {
    padding: 12,
    marginTop: 16,
    marginHorizontal: 8,
  },
  textArea: {
    flex: 1,
    minHeight: 100,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    color: THEME.text,
    fontSize: 14,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.primary,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: THEME.textLight,
    fontWeight: "500",
  },
  datePickerCaret: {
    marginLeft: 8,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: THEME.textMuted,
    marginBottom: 10,
  },
  timeSlotScrollContainer: {
    paddingBottom: 8,
  },
  timeSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 160,
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
    fontSize: 14,
    color: THEME.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  timeSlotTextSelected: {
    color: THEME.textLight,
  },
  timeSlotCheckContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
    marginRight: 8,
  },

  // Event cards
  upcomingEventsHeader: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 100,
  },
  upcomingEventsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.textLight,
  },
  upcomingEventsDivider: {
    height: 3,
    width: 40,
    backgroundColor: THEME.secondary,
    marginTop: 8,
    borderRadius: 2,
  },
  eventCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  eventCardContent: {
    padding: 16,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventCardActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  eventCardDetails: {
    gap: 6,
  },
  eventCardName: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  eventCardDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventCardDetailText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginLeft: 8,
  },
  eventCardDescription: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  eventCardDescriptionText: {
    fontSize: 14,
    color: THEME.textMuted,
    fontStyle: "italic",
  },

  // Empty state
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textLight,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 8,
  },

  // Success message
  successMessageContainer: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  successMessageBlur: {
    borderRadius: 16,
    overflow: "hidden",
    width: "90%",
    maxWidth: 320,
  },
  successMessageContent: {
    padding: 20,
    alignItems: "center",
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successMessageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textLight,
    marginBottom: 8,
  },
  successMessageText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  monthNavigationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerMonthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textLight,
  },
  calendarContainer: {
    padding: 16,
  },
  weekdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
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
  todayIndicator: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.primary,
  },
  datePickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  datePickerCancelText: {
    color: THEME.textMuted,
    fontWeight: "500",
  },
  datePickerConfirmButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  confirmButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  datePickerConfirmText: {
    color: THEME.textLight,
    fontWeight: "600",
  },
})

export default EventBooking


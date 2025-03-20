// import { View, Text, Button, Alert } from "react-native";
// import React from "react";
// import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { AntDesign } from "@expo/vector-icons";

// const AnimatedView = Animated.createAnimatedComponent(View);
// const handleCategory = () => {
//   Alert.alert("Clothes, Food")

// }
// const FirstTab = () => {
//   return (
//     <AnimatedView
//       entering={FadeIn.duration(500)}
//       exiting={FadeOut.duration(500)}
//       className="flex-1 items-center justify-center bg-white"
//     >
//       {/* <Ionicons name="home" size={50} color="#5DADE2" /> */}
//       <AntDesign name="home" size={50} color="#5DADE2" />
//       <Text className="text-2xl text-blue-300 mt-4">Home</Text>
//       <Button title="Category" onPress={handleCategory} />
//     </AnimatedView>
//   );
// };

// export default FirstTab;

// import React, { useState, useEffect } from "react";
// import { 
//   View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, ScrollView
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
// import { database as db } from "../../config/FirebaseConfig";
// import AntDesign from '@expo/vector-icons/AntDesign';

// type Donation = {
//   id: string;
//   name: string;
//   category: string;
//   amount?: number;
//   description?: string;
// };

// const DonationForm = () => {
//   const [name, setName] = useState<string>("");
//   const [amount, setAmount] = useState<string>("");
//   const [category, setCategory] = useState<string>("Food");
//   const [description, setDescription] = useState<string>("");
//   const [donations, setDonations] = useState<Donation[]>([]);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "donations"), (snapshot) => {
//       const donationList: Donation[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...(doc.data() as Omit<Donation, "id">), 
//       }));
//       setDonations(donationList);
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleSubmit = async () => {
//     if (!name || (!amount && category === "Money")) {
//       Alert.alert("Error", "Please enter all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const donationData = { name, category, amount: amount ? Number(amount) : undefined, description };

//       if (editingId) {
//         const donationRef = doc(db, "donations", editingId);
//         await updateDoc(donationRef, donationData);
//         setEditingId(null);
//       } else {
//         await addDoc(collection(db, "donations"), donationData);
//       }

//       setName("");
//       setAmount("");
//       setCategory("Food");
//       setDescription("");
//     } catch (error) {
//       Alert.alert("Error", "Failed to process donation.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (donation: Donation) => {
//     setEditingId(donation.id);
//     setName(donation.name);
//     setAmount(donation.amount ? donation.amount.toString() : "");
//     setCategory(donation.category);
//     setDescription(donation.description || "");
//   };

//   const handleDelete = async (id: string) => {
//     await deleteDoc(doc(db, "donations", id));
//   };

//   return (
//     <FlatList
//       ListHeaderComponent={
//         <View className="p-6 bg-white">
//           <Text className="text-2xl font-bold text-teal-700">Make a Donation</Text>
//           <Text className="text-md text-gray-600 mt-2">
//             Contribute to a cause and make a difference!
//           </Text>
  
//           {/* Form Fields */}
//           <Text className="text-lg font-semibold text-gray-800 mb-2">Your Name</Text>
//           <TextInput
//             placeholder="Enter your name"
//             value={name}
//             onChangeText={setName}
//             className="border border-gray-300 p-3 rounded-lg mb-4"
//           />
  
//           <Text className="text-lg font-semibold text-gray-800 mb-2">Category</Text>
//           <View className="border border-gray-300 rounded-lg">
//             <Picker selectedValue={category} onValueChange={setCategory}>
//               <Picker.Item label="Food" value="Food" />
//               <Picker.Item label="Clothes" value="Clothes" />
//               <Picker.Item label="Toys" value="Toys" />
//               <Picker.Item label="Miscellaneous" value="Miscellaneous" />
//               <Picker.Item label="Money" value="Money" />
//             </Picker>
//           </View>
  
//           {category === "Money" && (
//             <>
//               <Text className="text-lg font-semibold text-gray-800 mt-4">Donation Amount</Text>
//               <TextInput
//                 placeholder="Enter amount"
//                 value={amount}
//                 onChangeText={setAmount}
//                 keyboardType="numeric"
//                 className="border border-gray-300 p-3 rounded-lg mt-2"
//               />
//             </>
//           )}
  
//           {category === "Miscellaneous" && (
//             <>
//               <Text className="text-lg font-semibold text-gray-800 mt-4">Description</Text>
//               <TextInput
//                 placeholder="Describe your donation"
//                 value={description}
//                 onChangeText={setDescription}
//                 multiline
//                 className="border border-gray-300 p-3 rounded-lg mt-2 h-24"
//               />
//             </>
//           )}
  
//           <TouchableOpacity 
//             className="bg-teal-700 p-4 rounded-full shadow-lg mt-6"
//             onPress={handleSubmit}
//           >
//             <Text className="text-white text-center text-lg font-semibold">
//               {editingId ? "Update Donation" : "Donate Now"}
//             </Text>
//           </TouchableOpacity>
  
//           {loading && <ActivityIndicator size="large" color="blue" className="mt-4" />}
  
//           <Text className="text-xl font-semibold text-gray-800 mt-8 mb-4">Your Donations</Text>
//         </View>
//       }
//       data={donations}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <View className="bg-white p-4 rounded-xl shadow-md mb-3 flex-row justify-between">
//           <View>
//             <Text className="text-md font-medium">{item.category} Donation</Text>
//             <Text className="text-sm text-gray-500">
//               {item.name} {item.amount ? `- $${item.amount}` : ""}
//             </Text>
//             {item.description && <Text className="text-sm text-gray-400">{item.description}</Text>}
//           </View>
//           <View className="flex-row">
//             <TouchableOpacity onPress={() => handleEdit(item)} className="mr-4">
//               <AntDesign name="edit" size={22} color="blue" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleDelete(item.id)}>
//               <AntDesign name="delete" size={22} color="red" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     />
//   );
// }

// export default DonationForm;

// import React, { useState, useEffect } from "react";
// import { 
//   View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, 
//   StyleSheet,
//   Platform
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
// import { database as db } from "../../config/FirebaseConfig";
// import AntDesign from '@expo/vector-icons/AntDesign';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import {
//   Calendar,
// } from "react-native-feather"
// type Event = {
//   id: string;
//   name: string;
//   contact: string;
//   eventType: string;
//   location: string;
//   attendees: number;
//   eventDate: string;
//   eventTime: string;
//   description?: string;
// };

// const THEME = {
//   primary: "#1f6969",
//   primaryLight: "#2a8a8a",
//   primaryDark: "#184f4f",
//   secondary: "#f8b400",
//   accent: "#ff6b6b",
//   background: "#f7f9fc",
//   card: "#ffffff",
//   text: "#333333",
//   textLight: "#ffffff",
//   textMuted: "#7c8a97",
//   inputBorder: "#e0e0e0",
// }

// const EventBooking = () => {
//   const [name, setName] = useState<string>("");
//   const [contact, setContact] = useState<string>("");
//   const [eventType, setEventType] = useState<string>("Birthday Celebration");
//   const [location, setLocation] = useState<string>("Old Age Home");
//   const [attendees, setAttendees] = useState<string>("1");
//   const [eventDate, setEventDate] = useState<Date | null>(null);
//   const [eventTime, setEventTime] = useState<Date | null>(null);
//   const [description, setDescription] = useState<string>("");
//   const [events, setEvents] = useState<Event[]>([]);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showDatePicker, setShowDatePicker] = useState(false)
//   const [selectedDate, setSelectedDate] = useState(new Date())

//   const formatDate = (date: Date): string => {
//     const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }
//     return date.toLocaleDateString("en-US", options)
//   }
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
//       const eventList: Event[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...(doc.data() as Omit<Event, "id">), 
//       }));
//       setEvents(eventList);
//     });

//     return () => unsubscribe();
//   }, []);

//   const handleSubmit = async () => {
//     if (!name || !contact || !eventType || !location || !eventDate || !eventTime) {
//       Alert.alert("Error", "Please enter all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const eventData = { 
//         name, 
//         contact, 
//         eventType, 
//         location, 
//         attendees: Number(attendees), 
//         eventDate: eventDate.toISOString().split('T')[0], 
//         eventTime: eventTime.toLocaleTimeString(), 
//         description 
//       };

//       if (editingId) {
//         const eventRef = doc(db, "events", editingId);
//         await updateDoc(eventRef, eventData);
//         setEditingId(null);
//       } else {
//         await addDoc(collection(db, "events"), eventData);
//       }

//       // Reset fields after submission
//       setName("");
//       setContact("");
//       setEventType("Birthday Celebration");
//       setLocation("Old Age Home");
//       setAttendees("1");
//       setEventDate(null);
//       setEventTime(null);
//       setDescription("");
//     } catch (error) {
//       Alert.alert("Error", "Failed to process event.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (event: Event) => {
//     setEditingId(event.id);
//     setName(event.name);
//     setContact(event.contact);
//     setEventType(event.eventType);
//     setLocation(event.location);
//     setAttendees(event.attendees.toString());
//     setEventDate(new Date(event.eventDate));
//     setEventTime(new Date(`1970-01-01T${event.eventTime}`));
//     setDescription(event.description || "");
//   };

//   const handleDelete = async (id: string) => {
//     await deleteDoc(doc(db, "events", id));
//   };

//   return (
//     <FlatList
//       data={events}
//       renderItem={({ item }) => (
//         <View className="bg-white p-4 rounded-xl shadow-md mb-3 flex-row justify-between">
//           <View>
//             <Text className="text-md font-medium">{item.eventType}</Text>
//             <Text className="text-sm text-gray-500">
//               {item.name} - {item.eventDate} at {item.eventTime}
//             </Text>
//             {item.description && <Text className="text-sm text-gray-400">{item.description}</Text>}
//           </View>
//           <View className="flex-row">
//             <TouchableOpacity onPress={() => handleEdit(item)} className="mr-4">
//               <AntDesign name="edit" size={22} color="blue" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleDelete(item.id)}>
//               <AntDesign name="delete" size={22} color="red" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//       keyExtractor={(item) => item.id}
//       ListHeaderComponent={
//         <View className="p-6 bg-white">
//           <Text className="text-2xl font-bold text-teal-700">Book an Event</Text>
//           <Text className="text-md text-gray-600 mt-2">
//             Celebrate birthdays, organize langars, or plan a charity event at an orphanage, NGO, or old age home.
//           </Text>
  
//           {/* Name */}
//           <Text className="text-lg font-semibold text-gray-800 mb-2">Your Name</Text>
//           <TextInput
//             placeholder="Enter your name"
//             value={name}
//             onChangeText={setName}
//             className="border border-gray-300 p-3 rounded-lg mb-4"
//           />

//           {/* Contact Number */}
//           <Text className="text-lg font-semibold text-gray-800 mb-2">Contact Number</Text>
//           <TextInput
//             placeholder="Enter your contact number"
//             value={contact}
//             onChangeText={setContact}
//             keyboardType="phone-pad"
//             className="border border-gray-300 p-3 rounded-lg mb-4"
//           />
  
//           {/* Event Type */}
//           <Text className="text-lg font-semibold text-gray-800 mb-2">Event Type</Text>
//           <Picker selectedValue={eventType} onValueChange={setEventType} className="border border-gray-300 rounded-lg">
//             <Picker.Item label="Birthday Celebration" value="Birthday Celebration" />
//             <Picker.Item label="Langar (Food Distribution)" value="Langar" />
//             <Picker.Item label="Charity Drive" value="Charity Drive" />
//             <Picker.Item label="Educational Session" value="Educational Session" />
//             <Picker.Item label="Health Checkup Camp" value="Health Checkup Camp" />
//           </Picker>

//           {/* Location */}
//           <Text className="text-lg font-semibold text-gray-800 mb-2 mt-4">Location</Text>
//           <Picker selectedValue={location} onValueChange={setLocation} className="border border-gray-300 rounded-lg">
//             <Picker.Item label="Old Age Home" value="Old Age Home" />
//             <Picker.Item label="Orphanage" value="Orphanage" />
//             <Picker.Item label="NGO" value="NGO" />
//           </Picker>

//           {/* Number of Attendees */}
//           <Text className="text-lg font-semibold text-gray-800 mt-4">Number of Attendees</Text>
//           <TextInput
//             placeholder="Enter number of attendees"
//             value={attendees}
//             onChangeText={setAttendees}
//             keyboardType="numeric"
//             className="border border-gray-300 p-3 rounded-lg mt-2"
//           />

//           {/* Event Date */}
//           <Text className="text-lg font-semibold text-gray-800 mt-4">Event Date</Text>
//           {/* <TouchableOpacity onPress={() => setEventDate(new Date())}>
//             <Text className="border border-gray-300 p-3 rounded-lg">
//               {eventDate ? eventDate.toDateString() : "Select Date"}
//             </Text>
//           </TouchableOpacity> */}

//           {/* Date Picker Button */}
//           <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
//             <View style={styles.datePickerIconContainer}>
//               <Calendar width={20} height={20} color={THEME.primary} />
//             </View>
//             <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
//           </TouchableOpacity>


//           {/* Event Time */}
//           <Text className="text-lg font-semibold text-gray-800 mt-4">Event Time</Text>
//           <TouchableOpacity onPress={() => setEventTime(new Date())}>
//             <Text className="border border-gray-300 p-3 rounded-lg">
//               {eventTime ? eventTime.toLocaleTimeString() : "Select Time"}
//             </Text>
//           </TouchableOpacity>

//           {/* Additional Notes */}
//           <Text className="text-lg font-semibold text-gray-800 mt-4">Additional Notes</Text>
//           <TextInput
//             placeholder="Any special requests or details?"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             className="border border-gray-300 p-3 rounded-lg mt-2 h-24"
//           />

//           <TouchableOpacity className="bg-teal-700 p-4 rounded-full shadow-lg mt-6" onPress={handleSubmit}>
//             <Text className="text-white text-center text-lg font-semibold">
//               {editingId ? "Update Event" : "Book Now"}
//             </Text>
//           </TouchableOpacity>
  
//           {loading && <ActivityIndicator size="large" color="blue" className="mt-4" />}
//         </View>
//       }
//     />
//   );
// };

// const styles = StyleSheet.create({
  
//   datePickerButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: THEME.card,
//     borderRadius: 16,
//     padding: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   datePickerIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: "rgba(31, 105, 105, 0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   datePickerText: {
//     fontSize: 16,
//     color: THEME.text,
//     fontWeight: "500",
//   },
//   timeSlotLabel: {
//     fontSize: 15,
//     color: THEME.text,
//     marginTop: 16,
//     marginBottom: 8,
//     fontWeight: "500",
//   },
//   timeSlotsContainer: {
//     gap: 8,
//   },
//   timeSlotButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: THEME.card,
//     borderRadius: 12,
//     padding: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   timeSlotButtonSelected: {
//     backgroundColor: THEME.primary,
//     borderColor: THEME.primary,
//   },
//   timeSlotContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   timeSlotText: {
//     fontSize: 15,
//     color: THEME.text,
//     marginLeft: 8,
//   },
//   timeSlotTextSelected: {
//     color: THEME.textLight,
//     fontWeight: "500",
//   },
//   timeSlotCheckContainer: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   // Custom Date Picker Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   datePickerModal: {
//     width: "90%",
//     maxWidth: 360,
//     backgroundColor: THEME.card,
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   datePickerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   datePickerMonthYear: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: THEME.text,
//   },
//   weekdaysContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   weekdayText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: THEME.textMuted,
//     width: 36,
//     textAlign: "center",
//   },
//   calendarGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//   },
//   calendarDay: {
//     width: 36,
//     height: 36,
//     justifyContent: "center",
//     alignItems: "center",
//     margin: 2,
//     borderRadius: 18,
//   },
//   calendarDayOtherMonth: {
//     opacity: 0.4,
//   },
//   calendarDayPast: {
//     opacity: 0.3,
//   },
//   calendarDaySelected: {
//     backgroundColor: THEME.primary,
//   },
//   calendarDayToday: {
//     borderWidth: 1,
//     borderColor: THEME.primary,
//   },
//   calendarDayText: {
//     fontSize: 14,
//     color: THEME.text,
//   },
//   calendarDayTextOtherMonth: {
//     color: THEME.textMuted,
//   },
//   calendarDayTextPast: {
//     color: THEME.textMuted,
//   },
//   calendarDayTextSelected: {
//     color: THEME.textLight,
//     fontWeight: "600",
//   },
//   calendarDayTextToday: {
//     color: THEME.primary,
//     fontWeight: "600",
//   },
//   datePickerActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 20,
//     gap: 10,
//   },
//   datePickerCancelButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   datePickerCancelText: {
//     color: THEME.textMuted,
//     fontWeight: "500",
//   },
//   datePickerConfirmButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     backgroundColor: THEME.primary,
//   },
//   datePickerConfirmText: {
//     color: THEME.textLight,
//     fontWeight: "500",
//   },
//   suggestionsList: {
//     maxHeight: 150,
//     backgroundColor: THEME.background,
//     borderRadius: 8,
//     marginTop: 4,
//   },
//   suggestion: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: THEME.inputBorder,
//   },
//   suggestionText: {
//     color: THEME.text,
//     fontSize: 14,
//   },
// })


// export default EventBooking;

"use client"

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
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { database as db } from "../../config/FirebaseConfig"
import AntDesign from "@expo/vector-icons/AntDesign"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "react-native-feather"

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
}

// Time slots
const timeSlots = [
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
]

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

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false)

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

  const handleSubmit = async () => {
    if (!name || !contact || !eventType || !location || !eventDate || !selectedTimeSlot) {
      Alert.alert("Error", "Please enter all required fields.")
      return
    }

    setLoading(true)
    try {
      const eventData = {
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
      } else {
        await addDoc(collection(db, "events"), eventData)
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
      Alert.alert("Error", "Failed to process event.")
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
    await deleteDoc(doc(db, "events", id))
  }

  return (
    <FlatList
      data={events}
      renderItem={({ item }) => (
        <View className="bg-white p-4 rounded-xl shadow-md mb-3 flex-row justify-between">
          <View>
            <Text className="text-md font-medium">{item.eventType}</Text>
            <Text className="text-sm text-gray-500">
              {item.name} - {item.eventDate} at {item.eventTime}
            </Text>
            {item.description && <Text className="text-sm text-gray-400">{item.description}</Text>}
          </View>
          <View className="flex-row">
            <TouchableOpacity onPress={() => handleEdit(item)} className="mr-4">
              <AntDesign name="edit" size={22} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <AntDesign name="delete" size={22} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="p-6 bg-white">
          <Text className="text-2xl font-bold text-teal-700">Book an Event</Text>
          <Text className="text-md text-gray-600 mt-2">
            Celebrate birthdays, organize langars, or plan a charity event at an orphanage, NGO, or old age home.
          </Text>

          {/* Name */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">Your Name</Text>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            className="border border-gray-300 p-3 rounded-lg mb-4"
          />

          {/* Contact Number */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">Contact Number</Text>
          <TextInput
            placeholder="Enter your contact number"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
            className="border border-gray-300 p-3 rounded-lg mb-4"
          />

          {/* Event Type */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">Event Type</Text>
          <Picker selectedValue={eventType} onValueChange={setEventType} className="border border-gray-300 rounded-lg">
            <Picker.Item label="Birthday Celebration" value="Birthday Celebration" />
            <Picker.Item label="Langar (Food Distribution)" value="Langar" />
            <Picker.Item label="Charity Drive" value="Charity Drive" />
            <Picker.Item label="Educational Session" value="Educational Session" />
            <Picker.Item label="Health Checkup Camp" value="Health Checkup Camp" />
          </Picker>

          {/* Location */}
          <Text className="text-lg font-semibold text-gray-800 mb-2 mt-4">Location</Text>
          <Picker selectedValue={location} onValueChange={setLocation} className="border border-gray-300 rounded-lg">
            <Picker.Item label="Old Age Home" value="Old Age Home" />
            <Picker.Item label="Orphanage" value="Orphanage" />
            <Picker.Item label="NGO" value="NGO" />
          </Picker>

          {/* Number of Attendees */}
          <Text className="text-lg font-semibold text-gray-800 mt-4">Number of Attendees</Text>
          <TextInput
            placeholder="Enter number of attendees"
            value={attendees}
            onChangeText={setAttendees}
            keyboardType="numeric"
            className="border border-gray-300 p-3 rounded-lg mt-2"
          />

          {/* Event Date */}
          <Text className="text-lg font-semibold text-gray-800 mt-4">Event Date</Text>

          {/* Date Picker Button */}
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <View style={styles.datePickerIconContainer}>
              <Calendar width={20} height={20} color={THEME.primary} />
            </View>
            <Text style={styles.datePickerText}>{eventDate ? formatDate(eventDate) : "Select Date"}</Text>
          </TouchableOpacity>

          {/* Event Time */}
          <Text className="text-lg font-semibold text-gray-800 mt-4">Event Time</Text>

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
                    <AntDesign name="check" size={14} color={THEME.textLight} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Notes */}
          <Text className="text-lg font-semibold text-gray-800 mt-4">Additional Notes</Text>
          <TextInput
            placeholder="Any special requests or details?"
            value={description}
            onChangeText={setDescription}
            multiline
            className="border border-gray-300 p-3 rounded-lg mt-2 h-24"
          />

          <TouchableOpacity className="bg-teal-700 p-4 rounded-full shadow-lg mt-6" onPress={handleSubmit}>
            <Text className="text-white text-center text-lg font-semibold">
              {editingId ? "Update Event" : "Book Now"}
            </Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="blue" className="mt-4" />}
        </View>
      }
      ListFooterComponent={
        // Custom Date Picker Modal
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
                <TouchableOpacity style={styles.datePickerConfirmButton} onPress={confirmDateSelection}>
                  <Text style={styles.datePickerConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      }
    />
  )
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    marginTop: 8,
    marginBottom: 16,
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
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "500",
  },
  timeSlotsContainer: {
    gap: 8,
    marginBottom: 16,
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
})

export default EventBooking


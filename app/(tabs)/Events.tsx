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

import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { database as db } from "../../config/FirebaseConfig";
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';

type Event = {
  id: string;
  name: string;
  contact: string;
  eventType: string;
  location: string;
  attendees: number;
  eventDate: string;
  eventTime: string;
  description?: string;
};

const EventBooking = () => {
  const [name, setName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [eventType, setEventType] = useState<string>("Birthday Celebration");
  const [location, setLocation] = useState<string>("Old Age Home");
  const [attendees, setAttendees] = useState<string>("1");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState<Date | null>(null);
  const [description, setDescription] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventList: Event[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Event, "id">), 
      }));
      setEvents(eventList);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!name || !contact || !eventType || !location || !eventDate || !eventTime) {
      Alert.alert("Error", "Please enter all required fields.");
      return;
    }

    setLoading(true);
    try {
      const eventData = { 
        name, 
        contact, 
        eventType, 
        location, 
        attendees: Number(attendees), 
        eventDate: eventDate.toISOString().split('T')[0], 
        eventTime: eventTime.toLocaleTimeString(), 
        description 
      };

      if (editingId) {
        const eventRef = doc(db, "events", editingId);
        await updateDoc(eventRef, eventData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }

      // Reset fields after submission
      setName("");
      setContact("");
      setEventType("Birthday Celebration");
      setLocation("Old Age Home");
      setAttendees("1");
      setEventDate(null);
      setEventTime(null);
      setDescription("");
    } catch (error) {
      Alert.alert("Error", "Failed to process event.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setName(event.name);
    setContact(event.contact);
    setEventType(event.eventType);
    setLocation(event.location);
    setAttendees(event.attendees.toString());
    setEventDate(new Date(event.eventDate));
    setEventTime(new Date(`1970-01-01T${event.eventTime}`));
    setDescription(event.description || "");
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
  };

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
          <TouchableOpacity onPress={() => setEventDate(new Date())}>
            <Text className="border border-gray-300 p-3 rounded-lg">
              {eventDate ? eventDate.toDateString() : "Select Date"}
            </Text>
          </TouchableOpacity>

          {/* Event Time */}
          <Text className="text-lg font-semibold text-gray-800 mt-4">Event Time</Text>
          <TouchableOpacity onPress={() => setEventTime(new Date())}>
            <Text className="border border-gray-300 p-3 rounded-lg">
              {eventTime ? eventTime.toLocaleTimeString() : "Select Time"}
            </Text>
          </TouchableOpacity>

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
    />
  );
};

export default EventBooking;


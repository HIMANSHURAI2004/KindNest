// import { View, Text } from "react-native";
// import React from "react";
// import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
// import Ionicons from "react-native-vector-icons/Ionicons";

// const AnimatedView = Animated.createAnimatedComponent(View);

// const SecondTab = () => {
//   return (
//     <AnimatedView
//         entering={FadeIn.duration(500)}
//         exiting={FadeOut.duration(500)}
//         className="flex-1 items-center justify-center bg-white"
//     >
//         <Ionicons name="information-circle" size={50} color="#5DADE2" />
//         <Text className="text-2xl text-blue-300 mt-4">Explore</Text>
//     </AnimatedView>
//   )
// }

// export default SecondTab

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import AntDesign from "@expo/vector-icons/AntDesign";

const TrackScreen = () => {
  const router = useRouter();

  // Function to open Google Maps with a search query
  const openGoogleMaps = async (query: string) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let userLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = userLocation.coords;

    const googleMapsUrl: any = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
    router.push(googleMapsUrl);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-teal-700">Find Nearby Places</Text>
          <Text className="text-lg text-gray-600 mt-2 text-center">
            Select a category to locate nearby places and contribute to kindness.
          </Text>
        </View>

        {/* Category Buttons in a single column */}
        <View className="space-y-8 items-center">
          <TouchableOpacity
            className="bg-white py-8 px-6 rounded-xl shadow-md w-3/5 items-center mb-8"
            onPress={() => openGoogleMaps("Old Age Home")}
          >
            <AntDesign name="home" size={50} color="#007AFF" />
            <Text className="text-lg font-medium mt-3">Old Age Homes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-5 px-6 rounded-xl shadow-md w-3/5 items-center mb-8"
            onPress={() => openGoogleMaps("Orphanage")}
          >
            <AntDesign name="smileo" size={50} color="#FF5733" />
            <Text className="text-lg font-medium mt-3">Orphanages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-5 px-6 rounded-xl shadow-md w-3/5 items-center mb-8"
            onPress={() => openGoogleMaps("NGO")}
          >
            <AntDesign name="team" size={50} color="#28A745" />
            <Text className="text-lg font-medium mt-3">NGOs</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home Button */}
        <View className="items-center mt-10">
          <TouchableOpacity
            className="bg-teal-700 py-4 w-48 rounded-full shadow-lg"
            onPress={() => router.push("/")}
          >
            <Text className="text-white text-center text-lg font-semibold">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TrackScreen;


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

    const googleMapsUrl : any = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
    router.push(googleMapsUrl);
  };

  return (
    <ScrollView className="p-6 bg-white h-full">
      {/* Header */}
      <View className="my-6 items-center">
        <Text className="text-2xl font-bold text-teal-700">Find Nearby Places</Text>
        <Text className="text-md text-gray-600 mt-2 text-center">
          Select a category to locate nearby places and contribute to kindness.
        </Text>
      </View>

      {/* Category Buttons */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-800 mb-4">Choose a Category:</Text>

        <View className="flex-row flex-wrap gap-4 justify-center">
          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center"
            onPress={() => openGoogleMaps("Old Age Home")}>
            <AntDesign name="home" size={40} color="#007AFF" />
            <Text className="text-md font-medium mt-2">Old Age Homes</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center"
            onPress={() => openGoogleMaps("Orphanage")}>
            <AntDesign name="smileo" size={40} color="#FF5733" />
            <Text className="text-md font-medium mt-2">Orphanages</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center"
            onPress={() => openGoogleMaps("NGO")}>
            <AntDesign name="team" size={40} color="#28A745" />
            <Text className="text-md font-medium mt-2">NGOs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back to Home Button */}
      <View className="items-center mb-6">
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg"
          onPress={() => router.push("/")}>
          <Text className="text-white text-center text-lg font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TrackScreen;
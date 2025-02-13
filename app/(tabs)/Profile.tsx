// import { View, Text } from "react-native";
// import React from "react";
// import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
// import Feather from '@expo/vector-icons/Feather';
// const AnimatedView = Animated.createAnimatedComponent(View);

// const FourthTab = () => {
//   return (
//     <AnimatedView
//       entering={FadeIn.duration(500)}
//       exiting={FadeOut.duration(500)}
//       className="flex-1 items-center justify-center bg-white"
//     >
//       <Feather name="settings" size={24} color="#5DADE2" />
//       <Text className="text-2xl text-blue-300 mt-4">Settings</Text>
//     </AnimatedView>
//   );
// };

// export default FourthTab;
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-teal items-center px-6">
      {/* Profile Image */}
      <View className="mt-10 w-24 h-24 bg-gray-300 rounded-full" />

      {/* User Info */}
      <Text className="text-xl font-bold mt-4 text-gray-900">John Doe</Text>
      <Text className="text-gray-700">johndoe@example.com</Text>

      {/* Form Fields */}
      <View className="w-full max-w-md mt-6 space-y-4">
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="John Doe"
        />

        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="johndoe@example.com"
        />

        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="Enter new password"
          secureTextEntry
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity className="mt-6 w-full max-w-md bg-teal-500 py-3 rounded-md">
        <Text className="text-white font-bold text-center">Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

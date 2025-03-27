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
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLocalStorage } from '@/service/Storage';

export default function ProfileScreen() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getLocalStorage('userDetail');
      setUserInfo(data);
    };
    console.log(userInfo);
    fetchUserInfo();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white items-center px-6">
      {/* Profile Image */}
      <View className="mt-10 w-24 h-24 rounded-full overflow-hidden border-2 border-teal-500">
        <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          className="w-full h-full"
        />
      </View>

      {/* User Info */}
      <Text className="text-xl font-bold mt-4 text-gray-900">{name}</Text>
      <Text className="text-gray-700">{email}</Text>

      {/* Form Fields */}
      <View className="w-full max-w-md mt-6 space-y-4">
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Update & Logout Buttons */}
      <TouchableOpacity className="mt-6 w-full max-w-md bg-teal-500 py-3 rounded-md">
        <Text className="text-white font-bold text-center">Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 w-full max-w-md bg-red-500 py-3 rounded-md">
        <Text className="text-white font-bold text-center">Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


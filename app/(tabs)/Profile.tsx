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
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLocalStorage, setLocalStorage, RemoveLocalStorage } from '@/service/Storage';
import { LinearGradient } from 'expo-linear-gradient';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/FirebaseConfig';

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


export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; profilePic?: string } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getLocalStorage('userDetail');
      if (data) {
        setUserInfo(data);
        setName(data.name || "");
        setEmail(data.email || "");
      }
    };
    fetchUserInfo();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email cannot be empty.");
      return;
    }
    
    const updatedUser = { ...(userInfo || {}), name, email };
    await setLocalStorage('userDetail', updatedUser);
    setUserInfo(updatedUser);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const router = useRouter();
    
    const handleLogout = async () => {
      try {
        await RemoveLocalStorage('userDetail');
        await RemoveLocalStorage('role');
        await signOut(auth);
        router.replace('/login/SignIn'); 
      } catch (error) {
        console.error('Logout Error:', error);
      }
    };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <LinearGradient
        colors={[THEME.primary, THEME.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full py-10 items-center rounded-b-3xl shadow-lg"
      >
        {/* Profile Image */}
        <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white items-center justify-center bg-gray-200">
          {userInfo?.profilePic ? (
            <Image
              source={{ uri: userInfo.profilePic }}
              className="w-full h-full"
            />
          ) : (
            <EvilIcons name="user" size={80} color="#666" />
          )}
        </View>

        <Text className="text-xl font-bold mt-3 text-white">{name}</Text>
        <Text className="text-white opacity-80">{email}</Text>
      </LinearGradient>
      
      {/* Form Fields */}
      <View className="w-full mt-6 space-y-4">
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm"
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm"
          placeholder="Enter new password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      
      {/* Update & Logout Buttons */}
      <TouchableOpacity className="mt-6 w-full bg-teal-700 py-4 rounded-xl shadow-md" onPress={handleUpdateProfile}>
        <Text className="text-white font-bold text-center text-lg">Update Profile</Text>
      </TouchableOpacity>
      
      <View className="items-center px-3 py-4">
        <Button title="Logout" onPress={handleLogout} color="#e53e3e" />
      </View>
    </SafeAreaView>
  );
}


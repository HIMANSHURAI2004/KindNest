import { View, Text, Button, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/FirebaseConfig';
import { getLocalStorage, RemoveLocalStorage } from '@/service/Storage';
import AntDesign from '@expo/vector-icons/AntDesign';
// import Header from '@/components/Header';

const HomeScreen = () => {
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
    <ScrollView className="p-6 bg-white h-full">

      {/* <Header /> */}

      <View className="my-6">
        <Text className="text-2xl font-bold text-[#00A9A5]">Welcome to KindNest!</Text>
        <Text className="text-md text-gray-600 mt-2">Join us in spreading kindness to those in need.</Text>
      </View>
      

  
      <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-800 mb-4">Donate to:</Text>
        <View className="flex-row flex-wrap gap-4">
          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center">
            <Image source={require('@/assets/images/food.png')} className="w-16 h-16 mb-2" />
            <Text className="text-md font-medium">Food</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center">
            <Image source={require('@/assets/images/clothes.png')} className="w-16 h-16 mb-2" />
            <Text className="text-md font-medium">Clothes</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center">
            <Image source={require('@/assets/images/money.png')} className="w-16 h-16 mb-2" />
            <Text className="text-md font-medium">Money</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white p-4 rounded-xl shadow-md w-[45%] items-center">
            <Image source={require('@/assets/images/other.png')} className="w-16 h-16 mb-2" />
            <Text className="text-md font-medium">Others</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <View className="mb-6">
        <Text className="text-xl font-semibold text-gray-800 mb-4">Recent Donations</Text>
        <View className="bg-white p-4 rounded-xl shadow-md mb-3">
          <Text className="text-md font-medium">Food Donation</Text>
          <Text className="text-sm text-gray-500">You donated 10 meals on Jan 20</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-md mb-3">
          <Text className="text-md font-medium">Clothes Donation</Text>
          <Text className="text-sm text-gray-500">You donated 5 jackets on Jan 15</Text>
        </View>
      </View> */}

      <View className="items-center mb-6">
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg" onPress={() => router.replace('../donor/requestedDonations')}>
          <Text className="text-white text-center text-lg font-semibold">Requested</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-6">
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg" onPress={() => router.push('../donor')}>
          <Text className="text-white text-center text-lg font-semibold">Back to Donation</Text>
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <Button title="Logout" onPress={handleLogout} color="#e53e3e" />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
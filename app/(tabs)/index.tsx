// import { View, Text, Pressable } from 'react-native';
// import {Link, Redirect, useRouter} from 'expo-router';
// import React from 'react';
// import Animated, {FadeIn, FadeOut, SlideInRight, SlideOutLeft} from 'react-native-reanimated';

// const Index = () => {
//   const router = useRouter();

//   return (
//     <Animated.View
//     entering={FadeIn.duration(500)}
//     exiting={FadeOut.duration(500)}
//     className='flex-1 items-center justify-center bg-white'>
//       <Text className='text-blue-500 text-3xl '>Home</Text>
//       <Pressable onPress={() => router.push('/explore')} className='bg-blue-500 p-2 rounded-md'>
//         <Text className='text-white text-3xl'>Go to Explore</Text>
//       </Pressable>
//     </Animated.View>
//   )
// }

// export default Index

// import { View, Text, Button } from 'react-native'
// import React from 'react'
// import { useRouter } from 'expo-router'
// import { signOut } from 'firebase/auth'
// import { auth } from '@/config/FirebaseConfig'
// import { RemoveLocalStorage } from '@/service/Storage'

// const HomeScreen = () => {
//   const router = useRouter()

//   const handleLogout = async () => {
//     try {
//       await RemoveLocalStorage('userDetail')
//       await signOut(auth)
//       router.replace('/login') // Redirect to login screen after logout
//     } catch (error) {
//       console.error('Logout Error:', error)
//     }
//   }

//   return (
//     <View className="flex-1 items-center justify-center bg-white">
//       <Text className="text-lg font-bold">HomeScreen</Text>
//       <Button title="Logout" onPress={handleLogout} />
//     </View>
//   )
// }

// export default HomeScreen

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
        <Text className="text-2xl font-bold text-teal-700">Welcome to KindNest!</Text>
        <Text className="text-md text-gray-600 mt-2">Join us in spreading kindness to those in need.</Text>
      </View>
      

  
      {/* <View className="mb-6">
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

      <View className="mb-6">
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
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg" onPress={() => router.push('../features/donations')}>
          <Text className="text-white text-center text-lg font-semibold">Make a Donation</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-6">
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg" onPress={() => router.push('../donor')}>
          <Text className="text-white text-center text-lg font-semibold">Back to Donor</Text>
        </TouchableOpacity>
      </View>
      <View className="items-center mb-6">
        <TouchableOpacity className="bg-teal-700 p-4 w-48 rounded-full shadow-lg" onPress={() => router.push('../category')}>
          <Text className="text-white text-center text-lg font-semibold">Role selection</Text>
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <Button title="Logout" onPress={handleLogout} color="#e53e3e" />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
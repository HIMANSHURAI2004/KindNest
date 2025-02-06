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

import { View, Text, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/FirebaseConfig'
import { RemoveLocalStorage } from '@/service/Storage'

const HomeScreen = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await RemoveLocalStorage('userDetail')
      await signOut(auth)
      router.replace('/login') // Redirect to login screen after logout
    } catch (error) {
      console.error('Logout Error:', error)
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">HomeScreen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  )
}

export default HomeScreen


import { View, Text, TouchableOpacity, Image } from 'react-native'
import { StyleSheet } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'

const LoginScreen = () => {

  const router = useRouter()

  return (
      <View 
      className='h-full w-full'
      style = {{
       backgroundColor: Colors.PRIMARY,
      }}
      >
        <Image
          source={require('@/assets/images/image.png')}
          style={styles?.image}
          className='rounded-b-md w-full'
        />
        <View
         className='mt-[30px] p-5'
         >
          <Text className='text-center text-lg text-white font-semibold pb-1 font-[poppins]'>Kind🩵Nest</Text>
          <Text
            className='text-4xl font-bold text-white text-center font-[poppins]'
            >Empower Your Generosity !</Text>
          <Text
          className='text-white text-[15px] mt-2.5  text-center px-[10px] font-[poppins]'
          >Donate to Orphanages, NGOs and Elderly Homes with ease</Text>
          <TouchableOpacity
            className='bg-white p-2.5 rounded-[99px] mt-[20px]'
            onPress={() => router.push('/login/SignIn')}

            >
            <Text style={{
              color: Colors.PRIMARY
            }}
            className='text-center text-lg font-[poppins]'
            >Continue</Text>
          </TouchableOpacity>
          <Text
          className='text-center text-white text-xs mt-3 font-[poppins]'
          >Note : By Clicking Continue button, you will agree to our <Text className='underline'>terms and conditions </Text></Text>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 360,
    height: 430,
  }
})
export default LoginScreen


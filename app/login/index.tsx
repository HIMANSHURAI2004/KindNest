import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { StyleSheet } from 'react-native'
import React from 'react'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'

const LoginScreen = () => {

  const router = useRouter()

  return (
    <View>
      <View style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 50
       }}>
       {/* <View className='flex justify-center items-center mt-[50]'> */}
        <Image
          source={require('@/assets/images/login_image.png')}
          style={styles?.image}
        />
        <View style={{ 
          padding: 25,
          backgroundColor: Colors.PRIMARY,
          marginTop: 20,
          height: '50%',
         }}>
          <Text style={{ 
            fontSize: 30, 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center' 
            }}>Empower Your Generosity !</Text>
          <Text style={{
            color: 'white',
            fontSize: 18,
            marginTop: 10,
            textAlign: 'center'
          }} >Donate to Orphanages, NGOs and Elderly Homes with ease</Text>
          <TouchableOpacity style={styles?.button}
            onPress={() => router.push('/login/SignIn')}
            >
            <Text style={{
              textAlign: 'center',
              fontSize: 16,
              color: Colors.PRIMARY
            }}>Continue</Text>
          </TouchableOpacity>
          <Text style ={{
            color: 'white',
            fontSize: 12,
            marginTop: 10,
            textAlign: 'center'
          }}
          >Note : By Clicking Continue button, you will agree to our terms and conditions</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 210,
    height: 450,
    borderRadius: 23,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 99,
    marginTop: 25,
  }
})
export default LoginScreen


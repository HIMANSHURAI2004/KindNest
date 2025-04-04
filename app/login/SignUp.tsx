import { View, Text, TextInput, TouchableOpacity, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'
import { Link, useRouter } from 'expo-router'
import {auth, database} from '@/config/FirebaseConfig'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setLocalStorage } from '@/service/Storage'
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image'
import { setDoc, doc } from 'firebase/firestore';

const SignUp = () => {

    const router = useRouter()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');  
    
    const OnCreateAccount = async () => {
      if (!email || !password || !userName) {
          ToastAndroid.show('Please fill all details', ToastAndroid.BOTTOM);
          Alert.alert('Please fill all details');
          return;
      }

      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          await updateProfile(user, { displayName: userName });
          
          // Store user details in Firestore
          await setDoc(doc(database, 'users', user.uid), {
              uid: user.uid,
              displayName: userName,
              email: user.email,
              createdAt: new Date(),
          });
          
          await setLocalStorage('userDetail', user);
          router.replace('/category');
      } catch (error:any) {
          console.error(error.code);
          if (error.code === 'auth/email-already-in-use') {
              ToastAndroid.show('Email already exists', ToastAndroid.BOTTOM);
          } else {
              Alert.alert('Error', error.message);
          }
      }
  };
  


  return (
  <View
  className='h-full w-full flex justify-center items-center'
  >
    <View className='h-[30%] rounded-b-3xl w-full relative'
      style = {{
        backgroundColor: Colors.PRIMARY,
      }}
    >
      <View className='absolute bottom-2 flex justify-center w-full px-10 py-4'>
        <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} contentFit="contain" />
        <Text className='text-2xl font-bold text-left py-2 text-white font-[poppins]'>Create an account</Text>
        <Text className='text-left py-1 pr-4 text-slate-300 font-[poppins]'>Welcome! Please enter your details.</Text>
      </View>
    </View>
    <View className='h-[70%] w-full bg-white px-8 pt-5'>
      <TouchableOpacity
          className='flex  justify-center items-center w-full py-4 gap-2'
          style = {{
            display: 'flex',
            flexDirection: 'row',
            padding: 15,
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: 20,
            borderWidth: 1,
            borderColor: Colors.PRIMARY,
          }}
          onPress={() => router.push('/login/SignUp')
        }>
          <AntDesign name="google" size={24} color="teal" />
          <Text style= {{
              textAlign: 'center',
              fontSize: 16,
              color: Colors.PRIMARY
          }}
          className='font-[poppins]'
          >Sign up with google</Text>
      </TouchableOpacity>

      <View className='flex justify-center items-center w-full pt-2 pb-2'
        style = {{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <View className='h-[1px] bg-gray-300 w-[25%]' />
        <Text className='font-medium py-1 px-2 text-slate-500 font-[poppins]'>or</Text>
        <View className='h-[1px] bg-gray-300 w-[25%]' />
      </View>

      <View>

        <Text>Full Name</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your full name"
          onChangeText={(value) => setUserName(value)}
        />

        <Text className='font-medium pt-1 pb-0.5 pl-1 text-slate-700 font-[poppins]'>Email</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your email"
          onChangeText={(value) => setEmail(value)}
          className='font-[poppins]'

          />
        <Text className=' font-medium pt-1 pb-0.5 pl-1 text-slate-700 font-[poppins]'>Password</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your password"
          secureTextEntry={true}
          onChangeText={(value) => setPassword(value)}
          className='font-[poppins]'
          />
      </View>

      <TouchableOpacity style={styles?.button}
      onPress={OnCreateAccount}
      className='font-[poppins]'
      >
        <Text style= {{
            textAlign: 'center',
            fontSize: 16,
            color: 'white'
        }}>Sign up</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => router.push('/login/SignIn')}
      >
        <Text style= {{
            textAlign: 'center',
            fontSize: 13,
            color: Colors.PRIMARY
        }}
        className='underline font-[poppins] pt-2'
        >Already have an account? Sign in</Text>
      </TouchableOpacity>
      
    </View>
  </View>
    )
  }

  const styles = StyleSheet.create({
      textInput: {
              borderWidth: 0.5,
              borderColor: 'black',
              padding: 8,
              fontSize: 14,
              borderRadius: 10,
              marginTop: 5,
              backgroundColor: 'white',
              marginBottom: 20,
          },
          button: {
              backgroundColor: Colors.PRIMARY,
              padding: 15,
              borderRadius: 10,
              marginTop: 5,
              color: 'white',
          },
          buttonCreate: {
              padding: 15,
              backgroundColor: 'white',
              borderRadius: 10,
              marginTop: 15,
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
          },
          logoImage: {
            width: 70,
            height: 70,
          }
  })

  export default SignUp
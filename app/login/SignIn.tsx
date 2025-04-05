import { View, Text, TextInput, TouchableOpacity, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'
import { Link, useRouter } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, database } from '@/config/FirebaseConfig'
import { setLocalStorage } from '@/service/Storage'
import Octicons from '@expo/vector-icons/Octicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image'
import { doc, getDoc } from 'firebase/firestore'
const SignIn = () => {

    const router = useRouter()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');  

    const onSignInClick = () => {
      
      if(!email || !password) {
        // ToastAndroid.show('Please fill all details', ToastAndroid.BOTTOM)
        Alert.alert('Please enter email or password')
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
        const user = userCredential.user;
        // console.log(user);
        await setLocalStorage('userDetail', user)
        const userRef = doc(database, "users", user.uid);
          const userSnap = await getDoc(userRef);
    
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log(userData);
            
            if (userData.category) {
              await setLocalStorage("category",userData.category);
              router.replace(userData.category === "donor" ? "/donor" : "/");
            }
            if(userData.category === 'recipient')
            {
              await setLocalStorage("organizationDetails",userData.organizationDetails);
              return;
            }
          }
          else router.replace('/category')

      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if(errorCode === 'auth/invalid-credential') {
            Alert.alert('Invalid email or password')
        }
      });

    }


  return (
    <View
    className='h-full w-full flex justify-center items-center'
    >
      <View className='h-[40%] rounded-b-3xl w-full relative'
        style = {{
          backgroundColor: Colors.PRIMARY,
        }}
      >
        <View className='absolute bottom-2 flex justify-center w-full px-10 py-4'>
          {/* <FontAwesome name="sign-in" size={35} color="white" /> */}
          <Image source={require("@/assets/images/logo.png")} style={styles.logoImage} contentFit="contain" />
          <Text className='text-2xl font-bold text-left py-2 text-white font-[poppins]'>Sign In</Text>
          <Text className='text-left py-1 pr-4 text-slate-300 font-[poppins]'>Please enter the required information to sign in <Text className='text-slate-100 font-medium'>KindNest</Text></Text>
        </View>
      </View>
      <View className='h-[60%] w-full bg-white px-8 pt-5'>
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
            >Sign in with google</Text>
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
        onPress={onSignInClick}
        className='font-[poppins]'
        >
          <Text style= {{
              textAlign: 'center',
              fontSize: 16,
              color: 'white'
          }}>Login</Text>
        </TouchableOpacity>
        
          <Link href='/login/SignUp' style= {{
              textAlign: 'center',
              fontSize: 13,
              color: Colors.PRIMARY
          }}
          className='underline font-[poppins] pt-2'
          >Don't have an account? Sign Up</Link>
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
    },
})

export default SignIn
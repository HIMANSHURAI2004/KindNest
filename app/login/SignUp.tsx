import { View, Text, TextInput, TouchableOpacity, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import {auth} from '@/config/FirebaseConfig'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setLocalStorage } from '@/service/Storage'

const SignUp = () => {

    const router = useRouter()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');  
    const OnCreateAccount = ()  => {

      if(!email || !password || !userName) {
        ToastAndroid.show('Please fill all details', ToastAndroid.BOTTOM)
        Alert.alert('Please fill all details')
        return;
      }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        
        const user = userCredential.user;
        await updateProfile(user, {
          displayName: userName
        })
        await setLocalStorage('userDetail', user)
        // console.log(user);
        router.replace('/(tabs)')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        if(errorCode === 'auth/email-already-in-use') {
            ToastAndroid.show('Email already exist', ToastAndroid.BOTTOM)
        }
        
      });

    }

  return (
<View style= {{
        padding: 25,
    }}>
      <Text style={styles?.textHeader}>Let's Sign You Up !</Text>
      <Text style={styles?.subText}>Welcome</Text>
      {/* <Text style={styles?.subText}>You've been missed</Text> */}
      <View style={{marginTop: 25}}>

      <Text>Full Name</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your full name"
          onChangeText={(value) => setUserName(value)}
          />
        <Text>Email</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your email"
          onChangeText={(value) => setEmail(value)}
          />

        <Text>Password</Text>
        <TextInput
          style={styles?.textInput}
          placeholder="Enter your password"
          secureTextEntry={true}
          onChangeText={(value) => setPassword(value)}
          />
      </View>

      <TouchableOpacity style={styles?.button}
        onPress={OnCreateAccount}
      >
        <Text style= {{
            textAlign: 'center',
            fontSize: 16,
            color: 'white'
        }}>Sign Up</Text>
      </TouchableOpacity>
      

      <TouchableOpacity style={styles?.buttonCreate
        } onPress={() => router.push('/login/SignIn')
      }>
        {/* <Text>Don't have an account?</Text> */}
        <Text style= {{
            textAlign: 'center',
            fontSize: 16,
            color: Colors.PRIMARY
        }}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    textHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
        textAlign: 'center',
    },
    subText: {
        color: Colors.GRAY,
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center'
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        fontSize: 16,
        borderRadius: 10,
        marginTop: 5,
        backgroundColor: 'white',
        marginBottom: 35,
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
    }
})

export default SignUp
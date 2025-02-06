import { View, Text, TextInput, TouchableOpacity, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/config/FirebaseConfig'

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
      .then((userCredential) => {
        const user = userCredential.user;
        // console.log(user);
        router.replace('/(tabs)')

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
    <View style= {{
        padding: 25,
    }}>
      <Text style={styles?.textHeader}>Let's Sign You In !</Text>
      <Text style={styles?.subText}>Welcome Back</Text>
      <Text style={styles?.subText}>You've been missed</Text>
      <View style={{marginTop: 25}}>

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
       onPress={onSignInClick}
      >
        <Text style= {{
            textAlign: 'center',
            fontSize: 16,
            color: 'white'
        }}>Login</Text>
      </TouchableOpacity>
      

      <TouchableOpacity style={styles?.buttonCreate
        } onPress={() => router.push('/login/SignUp')
      }>
        <Text style= {{
            textAlign: 'center',
            fontSize: 16,
            color: Colors.PRIMARY
        }}>Don't have an account? Sign Up</Text>
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

export default SignIn
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
import { View, Text, Image, StyleSheet } from 'react-native'
import { Asset } from 'expo-asset';
import React from 'react'

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profilePicContainer}>
        <Image source={{ uri: require('@/assets/images/profile.jpg') }} style={styles.profilePic} />
      </View>

      {/* User Info */}
      <Text style={styles.userName}>John Doe</Text>
      <Text style={styles.userEmail}>johndoe@example.com</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd', // Placeholder background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
  },
})

export default ProfileScreen

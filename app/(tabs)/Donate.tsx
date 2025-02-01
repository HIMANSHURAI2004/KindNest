// import { View, Text, Button, Alert } from "react-native";
// import React from "react";
// import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { AntDesign } from "@expo/vector-icons";

// const AnimatedView = Animated.createAnimatedComponent(View);
// const handleCategory = () => {
//   Alert.alert("Clothes, Food")

// }
// const FirstTab = () => {
//   return (
//     <AnimatedView
//       entering={FadeIn.duration(500)}
//       exiting={FadeOut.duration(500)}
//       className="flex-1 items-center justify-center bg-white"
//     >
//       {/* <Ionicons name="home" size={50} color="#5DADE2" /> */}
//       <AntDesign name="home" size={50} color="#5DADE2" />
//       <Text className="text-2xl text-blue-300 mt-4">Home</Text>
//       <Button title="Category" onPress={handleCategory} />
//     </AnimatedView>
//   );
// };

// export default FirstTab;

import { View, Text } from 'react-native'
import React from 'react'

const DonateScreen = () => {
  return (
    <View>
      <Text>DonateScreen</Text>
    </View>
  )
}

export default DonateScreen
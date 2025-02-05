import { View, Text, Button } from "react-native";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Ionicons from "react-native-vector-icons/Ionicons";

const AnimatedView = Animated.createAnimatedComponent(View);

const SecondTab = () => {
  return (
    <AnimatedView
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
        className="flex-1 items-center justify-center bg-white"
    >
        <Ionicons name="information-circle" size={50} color="#3C6E71" />
        <Text className="text-2xl text-[#3C6E71] mt-4">Explore</Text>
        
    </AnimatedView>
  )
}

export default SecondTab
import { View, Text } from "react-native";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Feather from '@expo/vector-icons/Feather';
const AnimatedView = Animated.createAnimatedComponent(View);

const FourthTab = () => {
  return (
    <AnimatedView
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 items-center justify-center bg-white"
    >
      <Feather name="settings" size={24} color="#3C6E71" />
      <Text className="text-2xl text-[#3C6E71] mt-4">Settings</Text>
    </AnimatedView>
  );
};

export default FourthTab;
import { View, Text, Button, Alert, Pressable } from "react-native";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";

const AnimatedView = Animated.createAnimatedComponent(View);
const handleCategory = () => {
  Alert.alert("Clothes, Food")

}
const FirstTab = () => {
  return (
    <AnimatedView
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      className="flex-1 items-center justify-center bg-white"
    >
      <AntDesign name="home" size={50} color="#3C6E71" />
      <Text className="text-2xl text-[#3C6E71] mt-4">Home</Text>
      <Pressable onPress={handleCategory} className = "bg-[#3C6E71] m-2 rounded-md px-4 py-2">
        <Text className="text-white text-lg">Category</Text>
      </Pressable>
    </AnimatedView>
  );
};

export default FirstTab;
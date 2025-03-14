import { Stack } from "expo-router";
import '../global.css'
import { useFonts } from 'expo-font';
export default function RootLayout() {
  
    useFonts({
      'poppins' : require('../assets/fonts/Poppins-Regular.ttf'), 
      'poppins-bold' : require('../assets/fonts/Poppins-Bold.ttf'), 
      'poppins-medium' : require('../assets/fonts/Poppins-Medium.ttf'), 
    })

  return (


    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="category" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="donor" />
      <Stack.Screen name="recipient" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
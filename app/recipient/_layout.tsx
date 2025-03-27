import { Stack } from "expo-router";
export default function RootLayout() {
  
  return (


    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="food" />
      <Stack.Screen name="clothes" />
      <Stack.Screen name="money" />
      <Stack.Screen name="other" />

    </Stack>
  );
}
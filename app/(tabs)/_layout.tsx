// import { View, Text, useWindowDimensions, Pressable } from "react-native";
// import React from "react";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { AntDesign } from "@expo/vector-icons";
// import Feather from '@expo/vector-icons/Feather';
// import { TabView } from "react-native-tab-view";
// import FirstTab from "./Donate";
// import SecondTab from "./Track";
// import ThirdTab from "./Wishlist";
// import FourthTab from "./Profile";
// import HomeScreen from ".";
// // Define a custom type for the routes
// type Route = {
//   key: string;
//   title: string;
//   icon: string;
//   iconSet: "Ionicons" | "Feather" | "AntDesign";
// };

// const TabsLayout = () => {
//   const layout = useWindowDimensions();
//   const [index, setIndex] = React.useState(0);
//   const [routes] = React.useState<Route[]>([
//     { key: "first", title: "Home", icon: "home", iconSet: "AntDesign" },
//     { key: "second", title: "Explore", icon: "compass", iconSet: "Ionicons" },
//     { key: "third", title: "About", icon: "user", iconSet: "Feather" },
//     { key: "fourth", title: "Settings", icon: "settings", iconSet: "Feather" },
//   ]);

//   // Function to render each tab
//   const renderScene = ({ route }: { route: Route }) => {
//     switch (route.key) {
//       case "first":
//         return <HomeScreen />;
//       case "second":
//         return <SecondTab />;
//       case "third":
//         return <ThirdTab />;
//       case "fourth":
//         return <FourthTab />;
//       default:
//         return null;
//     }
//   };

//   // Helper function to render icons dynamically
//   const renderIcon = (iconSet: "Ionicons" | "Feather" | "AntDesign", iconName: any, color: string, size: number) => {
//     switch (iconSet) {
//       case "Ionicons":
//         return <Ionicons name={iconName} size={size} color={color} />;
//       case "AntDesign":
//         return <AntDesign name={iconName} size={size} color={color} />;
//       case "Feather":
//         return <Feather name={iconName} size={size} color={color} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <TabView
//       navigationState={{ index, routes }}
//       renderScene={renderScene}
//       onIndexChange={setIndex}
//       initialLayout={{ width: layout.width }}
//       tabBarPosition="bottom"
//       renderTabBar={() => (
//         <View style={{ flexDirection: "row", backgroundColor: "#5DADE2", paddingBottom: 10 }}>
//           {routes.map((route, routeIndex) => {
//             const isActive = index === routeIndex;
//             return (
//               <Pressable
//                 key={route.key}
//                 onPress={() => setIndex(routeIndex)}
//                 style={{
//                   flex: 1,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   padding: 10,
//                 }}
//               >
//                 {renderIcon(route.iconSet, route.icon, isActive ? "white" : "black", 24)}
//                 <Text style={{ color: isActive ? "white" : "black", fontSize: 12 }}>{route.title}</Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       )}
//     />
//   );
// };

// export default TabsLayout;

import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1f6969', 
        tabBarInactiveTintColor: '#666', 
        tabBarStyle: { backgroundColor: '#f8f8f8' },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Donate" 
        options={{ 
          tabBarLabel: 'Donate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Track" 
        options={{ 
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Wishlist" 
        options={{ 
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="Profile" 
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} 
      />
    </Tabs>
  )
}

export default TabLayout







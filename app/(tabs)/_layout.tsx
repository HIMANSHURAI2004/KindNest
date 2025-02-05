// import { Tabs } from 'expo-router';
// import React from 'react';
// import { Platform } from 'react-native';

// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarBackground: TabBarBackground,
//         tabBarStyle: Platform.select({
//           ios: {
//             // Use a transparent background on iOS to show the blur effect
//             position: 'absolute',
//           },
//           default: {},
//         }),
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
import { View, Text, useWindowDimensions, Pressable } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import { TabView } from "react-native-tab-view";
import FirstTab from "./firstTab";
import SecondTab from "./secondTab";
import ThirdTab from "./thirdTab";
import FourthTab from "./fourthTab";

// Define a custom type for the routes
type Route = {
  key: string;
  title: string;
  icon: string;
  iconSet: "Ionicons" | "Feather";
};

const TabsLayout = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState<Route[]>([
    { key: "first", title: "Home", icon: "home", iconSet: "AntDesign" },
    { key: "second", title: "Explore", icon: "compass", iconSet: "Ionicons" },
    { key: "third", title: "About", icon: "user", iconSet: "Feather" },
    { key: "fourth", title: "Settings", icon: "settings", iconSet: "Feather" },
  ]);

  // Function to render each tab
  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case "first":
        return <FirstTab />;
      case "second":
        return <SecondTab />;
      case "third":
        return <ThirdTab />;
      case "fourth":
        return <FourthTab />;
      default:
        return null;
    }
  };

  // Helper function to render icons dynamically
  const renderIcon = (iconSet: "Ionicons" | "Feather", iconName: string, color: string, size: number) => {
    switch (iconSet) {
      case "Ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "AntDesign":
        return <AntDesign name={iconName} size={size} color={color} />;
      case "Feather":
        return <Feather name={iconName} size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition="bottom"
      renderTabBar={() => (
        <View style={{ flexDirection: "row", backgroundColor: "#3C6E71", paddingBottom: 10 }}>
          {routes.map((route, routeIndex) => {
            const isActive = index === routeIndex;
            return (
              <Pressable
                key={route.key}
                onPress={() => setIndex(routeIndex)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
              >
                {renderIcon(route.iconSet, route.icon, isActive ? "white" : "black", 24)}
                <Text style={{ color: isActive ? "white" : "black", fontSize: 12 }}>{route.title}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    />
  );
};

export default TabsLayout;







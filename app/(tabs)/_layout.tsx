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
import { TabView, TabBar } from "react-native-tab-view";
import FirstTab from "./firstTab";
import SecondTab from "./secondTab";

const TabsLayout = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Home", icon: "home" },
    { key: "second", title: "Explore", icon: "information-circle" },
  ]);

  // Function to render each tab
  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "first":
        return <FirstTab />;
      case "second":
        return <SecondTab />;
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
      renderTabBar={(props) => (
        <View style={{ flexDirection: "row", backgroundColor: "#5DADE2", paddingBottom: 10 }}>
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
                <Ionicons name={route.icon} size={24} color={isActive ? "white" : "black"} />
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






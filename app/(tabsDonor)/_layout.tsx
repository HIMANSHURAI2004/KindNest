import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { getLocalStorage } from '@/service/Storage';
import AntDesign from '@expo/vector-icons/AntDesign';
const TabLayout = () => {
  const router = useRouter();
  useEffect(() => {
    GetUserDetail()
  }, [])

  const GetUserDetail = async()=> {
    const userInfo = await getLocalStorage('userDetail')
    if(!userInfo) {
      router.replace('/login')
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00A9A5', 
        tabBarInactiveTintColor: '#ffffff', 
        tabBarStyle: {
          backgroundColor: '#092327',
          borderTopWidth: 0,
          position: 'absolute', 
          bottom: 8,
          height:55,
          paddingHorizontal:5,
          marginHorizontal: 12,
          borderRadius: 20,
        },
        tabBarItemStyle: {
          borderRadius: 15, 
          
          // backgroundColor: '#A8E353',
          marginVertical: 5,
          marginHorizontal: 4,
        },
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
        name="Events" 
        options={{ 
          tabBarLabel: 'Event',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="RequestedDonations" 
        options={{ 
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircle" size={size} color={color} />
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







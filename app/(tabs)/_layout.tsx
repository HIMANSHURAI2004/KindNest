import { Tabs, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/FirebaseConfig';

const TabLayout = () => {
  const router = useRouter();

  const [authenticated,setAuthenticated] = useState<any>(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      // console.log(uid)
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
    }
  });

  useEffect(() => {
    if(authenticated==false) {
      router?.push('/login')
    }
  }, [authenticated])

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







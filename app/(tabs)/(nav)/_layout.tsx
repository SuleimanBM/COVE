import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { View,KeyboardAvoidingView,Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Image } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const HomeIcon = require("../../../assets/images/frame4.png");
  const NotiIcon = require("../../../assets/images/frame1.png");
  const ReelIcon = require("../../../assets/images/video3.png");
  const MarketIcon = require("../../../assets/images/frame2.png");
  const ProfileIcon = require("../../../assets/images/frame3.png");
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "index") {
              iconName = HomeIcon;
            } else if (route.name === "Notification") {
              iconName = NotiIcon;
            } else if (route.name === "Reel") {
              iconName = ReelIcon;
            } else if (route.name == "Market") {
              iconName = MarketIcon;
            } else {
              iconName = ProfileIcon;
            }

            // You can return any component that you like here!
            return (
              <Image
                source={iconName}
                style={{ width: size, height: size, tintColor: color }}
              />
            );
          },
          tabBarActiveTintColor: "#800000",
          tabBarInactiveTintColor: "grey",
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "white",
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, title: "Home" }}
        />
        <Tabs.Screen
          name="Notification"
          options={{ headerShown: false, title: "Notification" }}
        />
        <Tabs.Screen
          name="Reel"
          options={{ headerShown: false, title: "Reels" }}
        />
        <Tabs.Screen name="Market" options={{ headerShown: false }} />
        <Tabs.Screen name="Profile" options={{ headerShown: false }} />
        <Tabs.Screen name="something" options={{ headerShown: false }} />
      </Tabs>
    </View>
  );
}

import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function StackLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Message"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Signin"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="Signup"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="ProductDetails"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="(nav)"
            options={{ headerShown: false, animation: "ios" }}
          />
          <Stack.Screen
            name="ReelProfile"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="FindFriends"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="HomeMessages"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="SavedProducts"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="ProfilePic"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="SignUpDetails"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="SignUpName"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="MainMessagePage"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="ChatPage"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="FriendsPage"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="FriendsRequestPage"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="HomeSpaces"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

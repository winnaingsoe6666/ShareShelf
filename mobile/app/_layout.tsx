import "../global.css";
import "@/lib/i18n";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getToken } from "@/lib/auth";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Let auth state initialize before rendering
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="items/[id]" options={{ headerShown: true, title: "Item Detail" }} />
        <Stack.Screen name="items/new" options={{ headerShown: true, title: "Add Item" }} />
        <Stack.Screen name="messages/[itemId]/[userId]" options={{ headerShown: true, title: "Chat" }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: true, title: "Edit Profile" }} />
        <Stack.Screen name="login" options={{ headerShown: true, title: "Sign In" }} />
        <Stack.Screen name="register" options={{ headerShown: true, title: "Sign Up" }} />
        <Stack.Screen name="community" options={{ headerShown: true, title: "Community" }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: "Notifications" }} />
      </Stack>
    </>
  );
}

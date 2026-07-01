import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; refreshToken?: string }>();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      if (params.token && params.refreshToken) {
        // Save tokens from OAuth callback
        const { createAuthSession } = await import("@shareshelf/shared");
        const { asyncStorageAdapter } = await import("@/lib/storage");
        const session = createAuthSession(asyncStorageAdapter);
        await session.setToken(params.token, params.refreshToken);

        // Fetch user profile
        const meRes = await api.auth.getMe();
        if (meRes.success && meRes.data) {
          await saveAuth(meRes.data);
        }
        router.replace("/(tabs)/browse");
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text className="text-stone-400 mt-4">Completing sign in...</Text>
    </View>
  );
}

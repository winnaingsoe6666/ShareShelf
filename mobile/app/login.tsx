import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { api } from "@/lib/api";
import { saveAuth, isAuthenticated } from "@/lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (auth) router.replace("/(tabs)/browse");
    });
  }, [router]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login({ email: email.trim(), password });
      if (res.success && res.data) {
        await saveAuth(res.data);
        router.replace("/(tabs)/browse");
      } else {
        Alert.alert("Error", res.message || "Login failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    // For web, redirect directly; for native, use WebBrowser
    const oauthUrl = `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api"}/oauth2/authorization/google`;

    if (Platform.OS === "web") {
      window.location.href = oauthUrl;
    } else {
      try {
        const result = await WebBrowser.openAuthSessionAsync(oauthUrl, "shareshelf://");
        if (result.type === "success" && result.url) {
          // The callback URL should contain token and refreshToken
          const url = new URL(result.url);
          const token = url.searchParams.get("token");
          const refreshToken = url.searchParams.get("refreshToken");
          if (token && refreshToken) {
            const meRes = await api.auth.getMe();
            if (meRes.success && meRes.data) {
              await saveAuth(meRes.data);
              router.replace("/(tabs)/browse");
            }
          }
        }
      } catch {
        Alert.alert("Error", "Google sign-in failed");
      }
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-8 justify-center py-12">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary-700 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">SS</Text>
          </View>
          <Text className="text-2xl font-bold text-stone-800">Welcome Back</Text>
          <Text className="text-stone-400 mt-1">Sign in to ShareShelf</Text>
        </View>

        {/* Google Sign In */}
        <TouchableOpacity
          className="bg-white border border-stone-300 rounded-full py-4 flex-row items-center justify-center mb-6"
          onPress={handleGoogleLogin}
        >
          <Text className="text-stone-700 font-medium">Continue with Google</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="text-stone-400 mx-4">or</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

        {/* Email/Password form */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Email</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-stone-600 mb-1">Password</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a8a29e"
          />
        </View>

        <TouchableOpacity
          className={`bg-primary-700 rounded-full py-4 items-center ${loading ? "opacity-60" : ""}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 items-center"
          onPress={() => router.push("/register")}
        >
          <Text className="text-stone-500">
            Don't have an account? <Text className="text-primary-700 font-medium">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

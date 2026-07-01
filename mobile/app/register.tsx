import { useState } from "react";
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
import { saveAuth } from "@/lib/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
        community: community.trim() || undefined,
      });
      if (res.success && res.data) {
        await saveAuth(res.data);
        router.replace("/(tabs)/browse");
      } else {
        Alert.alert("Error", res.message || "Registration failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    const oauthUrl = `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api"}/oauth2/authorization/google`;

    if (Platform.OS === "web") {
      window.location.href = oauthUrl;
    } else {
      try {
        await WebBrowser.openAuthSessionAsync(oauthUrl, "shareshelf://");
      } catch {
        Alert.alert("Error", "Google sign-up failed");
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
          <Text className="text-2xl font-bold text-stone-800">Join ShareShelf</Text>
          <Text className="text-stone-400 mt-1">Start sharing with your community</Text>
        </View>

        {/* Google Sign Up */}
        <TouchableOpacity
          className="bg-white border border-stone-300 rounded-full py-4 flex-row items-center justify-center mb-6"
          onPress={handleGoogleRegister}
        >
          <Text className="text-stone-700 font-medium">Sign up with Google</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="text-stone-400 mx-4">or</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

        {/* Form */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Name *</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Email *</Text>
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

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Password *</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder="Min 8 chars, uppercase + digit"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-stone-600 mb-1">Community</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder="e.g., Downtown, Midtown"
            value={community}
            onChangeText={setCommunity}
            placeholderTextColor="#a8a29e"
          />
        </View>

        <TouchableOpacity
          className={`bg-primary-700 rounded-full py-4 items-center ${loading ? "opacity-60" : ""}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 items-center"
          onPress={() => router.push("/login")}
        >
          <Text className="text-stone-500">
            Already have an account? <Text className="text-primary-700 font-medium">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

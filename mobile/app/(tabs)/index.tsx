import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { CommunityStats } from "@shareshelf/shared";

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    isAuthenticated().then(setLoggedIn);
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.community.getCommunityStats();
      setStats(data);
    } catch {
      // ignore
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
    >
      {/* Hero */}
      <View className="bg-primary-700 px-6 py-12">
        <Text className="text-3xl font-bold text-white text-center">
          Share Tools,{"\n"}Build Community
        </Text>
        <Text className="text-primary-200 text-center mt-3 text-base">
          Borrow and lend tools with your neighbors
        </Text>

        {!loggedIn && (
          <View className="flex-row gap-3 mt-6 justify-center">
            <TouchableOpacity
              className="bg-white px-6 py-3 rounded-full"
              onPress={() => router.push("/register")}
            >
              <Text className="text-primary-700 font-semibold">Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-white px-6 py-3 rounded-full"
              onPress={() => router.push("/login")}
            >
              <Text className="text-white font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {loggedIn && (
          <TouchableOpacity
            className="bg-emerald-500 px-6 py-3 rounded-full mt-6 self-center"
            onPress={() => router.push("/(tabs)/browse")}
          >
            <Text className="text-white font-semibold">Browse Tools</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      {stats && (
        <View className="flex-row justify-around py-8 px-4">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-700">{stats.totalItems}</Text>
            <Text className="text-stone-500 text-sm">Tools</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-700">{stats.totalMembers}</Text>
            <Text className="text-stone-500 text-sm">Members</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-700">{stats.activeBorrows}</Text>
            <Text className="text-stone-500 text-sm">Active Borrows</Text>
          </View>
        </View>
      )}

      {/* How it works */}
      <View className="px-6 py-8">
        <Text className="text-xl font-bold text-stone-800 text-center mb-6">How It Works</Text>
        {[
          { step: "1", title: "List Your Tools", desc: "Share tools you rarely use" },
          { step: "2", title: "Browse & Request", desc: "Find what you need nearby" },
          { step: "3", title: "Borrow & Return", desc: "Meet up and share safely" },
        ].map((item) => (
          <View key={item.step} className="flex-row items-start mb-4 bg-stone-50 p-4 rounded-xl">
            <View className="bg-primary-700 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">{item.step}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-stone-800">{item.title}</Text>
              <Text className="text-stone-500 text-sm">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

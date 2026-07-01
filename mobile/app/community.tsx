import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Users, Package, ArrowLeftRight, Star } from "lucide-react-native";
import { api } from "@/lib/api";
import { formatPrice } from "@shareshelf/shared";
import type { CommunityStats } from "@shareshelf/shared";

export default function CommunityScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await api.community.getCommunityStats();
      setStats(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-stone-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
    >
      {/* Stats cards */}
      {stats && (
        <View className="flex-row flex-wrap px-4 pt-4 gap-3">
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] border border-stone-200 items-center">
            <Package size={24} color="#7c3aed" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{stats.totalItems}</Text>
            <Text className="text-stone-400 text-sm">Tools Shared</Text>
          </View>
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] border border-stone-200 items-center">
            <Users size={24} color="#7c3aed" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{stats.totalMembers}</Text>
            <Text className="text-stone-400 text-sm">Members</Text>
          </View>
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] border border-stone-200 items-center">
            <ArrowLeftRight size={24} color="#7c3aed" />
            <Text className="text-2xl font-bold text-stone-800 mt-2">{stats.activeBorrows}</Text>
            <Text className="text-stone-400 text-sm">Active Borrows</Text>
          </View>
        </View>
      )}

      {/* Recent items */}
      {stats?.recentItems && stats.recentItems.length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-stone-800 mb-3">Recent Listings</Text>
          {stats.recentItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 p-4 mb-3 flex-row"
              onPress={() => router.push(`/items/${item.id}`)}
            >
              {item.imageUrls?.[0] ? (
                <Image
                  source={{ uri: item.imageUrls[0] }}
                  className="w-16 h-16 rounded-lg mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-lg bg-stone-100 mr-3 items-center justify-center">
                  <Package size={20} color="#a8a29e" />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-semibold text-stone-800" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-primary-700 font-bold mt-1">
                  {item.dailyPrice != null ? `${formatPrice(item.dailyPrice)}/day` : "Free"}
                </Text>
                <Text className="text-stone-400 text-xs mt-1">{item.ownerName}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Top lenders */}
      {stats?.topLenders && stats.topLenders.length > 0 && (
        <View className="px-4 mt-6 mb-8">
          <Text className="text-lg font-bold text-stone-800 mb-3">Top Lenders</Text>
          {stats.topLenders.map((lender, index) => (
            <View
              key={lender.userId}
              className="bg-white rounded-xl border border-stone-200 p-4 mb-3 flex-row items-center"
            >
              <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Text className="text-primary-700 font-bold">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-stone-800">{lender.name}</Text>
                <Text className="text-stone-400 text-sm">{lender.itemCount} tools shared</Text>
              </View>
              <View className="flex-row items-center">
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text className="text-stone-600 text-sm ml-1">
                  {Number(lender.trustScore).toFixed(1)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

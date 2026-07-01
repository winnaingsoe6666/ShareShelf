import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Settings, Star, Shield, Package, LogOut } from "lucide-react-native";
import { api } from "@/lib/api";
import { isAuthenticated, getUser, clearAuth } from "@/lib/auth";
import { formatPrice } from "@shareshelf/shared";
import type { User, Item, Review } from "@shareshelf/shared";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) router.replace("/login");
    });
    loadProfile();
  }, [router]);

  const loadProfile = useCallback(async () => {
    try {
      const u = await getUser();
      setUser(u);
      if (u) {
        const [itemsData, reviewsData] = await Promise.all([
          api.items.getItems({ page: 0, size: 100 }),
          api.review.getUserReviews(u.id),
        ]);
        setItems(itemsData.content.filter((i) => i.ownerId === u.id));
        setReviews(reviewsData);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await api.auth.logout();
          } catch {
            // ignore
          }
          await clearAuth();
          router.replace("/login");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!user) return null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <ScrollView
      className="flex-1 bg-stone-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
    >
      {/* Profile header */}
      <View className="bg-primary-700 px-6 py-8 items-center">
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} className="w-20 h-20 rounded-full" />
        ) : (
          <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center">
            <Text className="text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-white text-xl font-bold mt-3">{user.name}</Text>
        {user.community && (
          <Text className="text-primary-200 text-sm mt-1">{user.community}</Text>
        )}
        {user.bio && (
          <Text className="text-primary-200 text-sm mt-2 text-center">{user.bio}</Text>
        )}
      </View>

      {/* Stats */}
      <View className="flex-row justify-around py-6 bg-white border-b border-stone-200">
        <View className="items-center">
          <Package size={20} color="#7c3aed" />
          <Text className="text-lg font-bold text-stone-800 mt-1">{items.length}</Text>
          <Text className="text-stone-400 text-xs">Listed</Text>
        </View>
        <View className="items-center">
          <Star size={20} color="#7c3aed" />
          <Text className="text-lg font-bold text-stone-800 mt-1">
            {avgRating || "—"}
          </Text>
          <Text className="text-stone-400 text-xs">Rating</Text>
        </View>
        <View className="items-center">
          <Shield size={20} color="#7c3aed" />
          <Text className="text-lg font-bold text-stone-800 mt-1">
            {user.trustScore?.toFixed(1) || "—"}
          </Text>
          <Text className="text-stone-400 text-xs">Trust</Text>
        </View>
      </View>

      {/* Verification */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 border border-stone-200">
        <Text className="font-semibold text-stone-800 mb-3">Verification</Text>
        <View className="flex-row items-center mb-2">
          <View className={`w-3 h-3 rounded-full mr-2 ${user.isIdVerified ? "bg-emerald-500" : "bg-stone-300"}`} />
          <Text className="text-stone-600 text-sm">ID Verified</Text>
        </View>
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2 ${user.bio ? "bg-emerald-500" : "bg-stone-300"}`} />
          <Text className="text-stone-600 text-sm">Profile Complete</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="mx-4 mt-4 gap-3">
        <TouchableOpacity
          className="bg-white rounded-xl p-4 border border-stone-200 flex-row items-center"
          onPress={() => router.push("/profile/edit")}
        >
          <Settings size={18} color="#57534e" />
          <Text className="text-stone-700 font-medium ml-3">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 border border-stone-200 flex-row items-center"
          onPress={() => router.push("/notifications")}
        >
          <Star size={18} color="#57534e" />
          <Text className="text-stone-700 font-medium ml-3">Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 border border-stone-200 flex-row items-center"
          onPress={() => router.push("/community")}
        >
          <Package size={18} color="#57534e" />
          <Text className="text-stone-700 font-medium ml-3">Community</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-50 rounded-xl p-4 border border-red-200 flex-row items-center"
          onPress={handleLogout}
        >
          <LogOut size={18} color="#dc2626" />
          <Text className="text-red-600 font-medium ml-3">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews */}
      {reviews.length > 0 && (
        <View className="mx-4 mt-6 mb-8">
          <Text className="font-semibold text-stone-800 mb-3">Reviews ({reviews.length})</Text>
          {reviews.slice(0, 5).map((review) => (
            <View key={review.id} className="bg-white rounded-xl p-4 border border-stone-200 mb-2">
              <View className="flex-row justify-between">
                <Text className="font-medium text-stone-700">{review.reviewerName}</Text>
                <View className="flex-row items-center">
                  <Star size={14} color="#eab308" fill="#eab308" />
                  <Text className="text-stone-600 text-sm ml-1">{review.rating}</Text>
                </View>
              </View>
              {review.comment && (
                <Text className="text-stone-500 text-sm mt-1">{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

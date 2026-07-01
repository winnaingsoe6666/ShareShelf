import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { timeAgo } from "@shareshelf/shared";
import type { Conversation } from "@shareshelf/shared";

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) router.replace("/login");
    });
    loadConversations();
  }, [router]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.chat.getConversations();
      setConversations(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }

  function renderItem({ item }: { item: Conversation }) {
    return (
      <TouchableOpacity
        className="bg-white border-b border-stone-100 px-4 py-4 flex-row items-center"
        onPress={() => router.push(`/messages/${item.itemId}/${item.otherUserId}`)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        {item.otherUserAvatarUrl ? (
          <Image
            source={{ uri: item.otherUserAvatarUrl }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-3">
            <Text className="text-primary-700 font-bold text-lg">
              {item.otherUserName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-stone-800 text-base" numberOfLines={1}>
              {item.otherUserName}
            </Text>
            <Text className="text-xs text-stone-400">{timeAgo(item.lastMessageAt)}</Text>
          </View>
          <Text className="text-stone-400 text-xs mt-0.5" numberOfLines={1}>
            Re: {item.itemTitle}
          </Text>
          <Text className="text-stone-500 text-sm mt-1" numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>

        {/* Unread badge */}
        {item.unreadCount > 0 && (
          <View className="bg-primary-700 w-6 h-6 rounded-full items-center justify-center ml-2">
            <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      <FlatList
        data={conversations}
        keyExtractor={(item) => `${item.itemId}-${item.otherUserId}`}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <MessageSquare size={48} color="#d6d3d1" />
            <Text className="text-stone-400 text-base mt-4">No conversations yet</Text>
            <Text className="text-stone-300 text-sm mt-1">
              Start a conversation from an item page
            </Text>
          </View>
        }
      />
    </View>
  );
}

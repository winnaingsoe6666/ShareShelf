import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell, Check, CheckCheck } from "lucide-react-native";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { timeAgo } from "@shareshelf/shared";
import type { Notification } from "@shareshelf/shared";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) router.replace("/login");
    });
    loadNotifications();
  }, [router]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.notification.getNotifications(0, 50);
      setNotifications(data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }

  async function handleMarkRead(notification: Notification) {
    if (!notification.isRead) {
      try {
        await api.notification.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch {
        // ignore
      }
    }

    // Navigate to related item/borrow if applicable
    if (notification.relatedItemId) {
      router.push(`/items/${notification.relatedItemId}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.notification.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "borrow_requested":
        return "📋";
      case "borrow_approved":
        return "✅";
      case "borrow_rejected":
        return "❌";
      case "borrow_returned":
        return "🔄";
      case "borrow_cancelled":
        return "🚫";
      case "review_received":
        return "⭐";
      default:
        return "🔔";
    }
  }

  function renderItem({ item }: { item: Notification }) {
    return (
      <TouchableOpacity
        className={`bg-white border-b border-stone-100 px-4 py-4 flex-row items-start ${
          !item.isRead ? "bg-primary-50" : ""
        }`}
        onPress={() => handleMarkRead(item)}
        activeOpacity={0.7}
      >
        <Text className="text-xl mr-3">{getNotificationIcon(item.type)}</Text>
        <View className="flex-1">
          <Text
            className={`text-sm leading-5 ${!item.isRead ? "font-medium text-stone-800" : "text-stone-600"}`}
          >
            {item.message}
          </Text>
          <Text className="text-xs text-stone-400 mt-1">{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.isRead && (
          <View className="w-2 h-2 rounded-full bg-primary-700 mt-2 ml-2" />
        )}
      </TouchableOpacity>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View className="flex-1 bg-stone-50">
      {/* Header actions */}
      {unreadCount > 0 && (
        <View className="bg-white px-4 py-3 border-b border-stone-200 flex-row justify-between items-center">
          <Text className="text-stone-600 text-sm">{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllRead} className="flex-row items-center">
            <CheckCheck size={16} color="#7c3aed" />
            <Text className="text-primary-700 text-sm ml-1">Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Bell size={48} color="#d6d3d1" />
              <Text className="text-stone-400 text-base mt-4">No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

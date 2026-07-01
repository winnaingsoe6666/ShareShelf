import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { isAuthenticated, getUser } from "@/lib/auth";
import { formatDate } from "@shareshelf/shared";
import type { BorrowRequest, User } from "@shareshelf/shared";

type Tab = "borrowed" | "lent";

export default function BorrowsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("borrowed");
  const [borrows, setBorrows] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) router.replace("/login");
    });
    getUser().then(setCurrentUser);
  }, [router]);

  const loadBorrows = useCallback(async () => {
    try {
      const data = await api.borrow.getBorrows(0, 100);
      setBorrows(data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBorrows();
  }, [loadBorrows]);

  async function onRefresh() {
    setRefreshing(true);
    await loadBorrows();
    setRefreshing(false);
  }

  async function handleAction(id: number, action: "approve" | "reject" | "return" | "cancel") {
    const labels = { approve: "Approve", reject: "Reject", return: "Return", cancel: "Cancel" };
    Alert.alert(`${labels[action]} Request`, `Are you sure?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await api.borrow[`${action}Borrow`](id);
            await loadBorrows();
          } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || "Action failed");
          }
        },
      },
    ]);
  }

  const filtered = borrows.filter((b) => {
    if (!currentUser) return false;
    return tab === "borrowed" ? b.borrowerId === currentUser.id : b.ownerId === currentUser.id;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    returned: "bg-blue-100 text-blue-700",
    cancelled: "bg-stone-100 text-stone-500",
  };

  function renderItem({ item }: { item: BorrowRequest }) {
    const isOwner = currentUser?.id === item.ownerId;
    const colorClass = statusColors[item.status] || "bg-stone-100 text-stone-500";
    const [bgColor, textColor] = colorClass.split(" ");

    return (
      <TouchableOpacity
        className="bg-white rounded-xl border border-stone-200 p-4 mb-3"
        onPress={() => router.push(`/items/${item.itemId}`)}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-semibold text-stone-800 flex-1" numberOfLines={1}>
            {item.itemTitle}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ml-2 ${bgColor}`}>
            <Text className={`text-xs font-medium ${textColor}`}>{item.status}</Text>
          </View>
        </View>

        <Text className="text-stone-500 text-sm mt-1">
          {isOwner ? `Borrower: ${item.borrowerName}` : `Owner: ${item.ownerName}`}
        </Text>

        {item.startDate && item.endDate && (
          <Text className="text-stone-400 text-xs mt-1">
            {formatDate(item.startDate)} — {formatDate(item.endDate)}
          </Text>
        )}

        {item.message && (
          <Text className="text-stone-400 text-sm mt-2 italic" numberOfLines={2}>
            "{item.message}"
          </Text>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-2 mt-3">
          {item.status === "pending" && isOwner && (
            <>
              <TouchableOpacity
                className="bg-emerald-500 px-4 py-2 rounded-full flex-1"
                onPress={() => handleAction(item.id, "approve")}
              >
                <Text className="text-white text-center font-medium text-sm">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-full flex-1"
                onPress={() => handleAction(item.id, "reject")}
              >
                <Text className="text-white text-center font-medium text-sm">Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === "pending" && !isOwner && (
            <TouchableOpacity
              className="bg-stone-200 px-4 py-2 rounded-full"
              onPress={() => handleAction(item.id, "cancel")}
            >
              <Text className="text-stone-600 font-medium text-sm">Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === "approved" && (
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-full"
              onPress={() => handleAction(item.id, "return")}
            >
              <Text className="text-white font-medium text-sm">Mark Returned</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      {/* Tab switcher */}
      <View className="flex-row bg-white border-b border-stone-200">
        {(["borrowed", "lent"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            className={`flex-1 py-3 items-center ${tab === t ? "border-b-2 border-primary-700" : ""}`}
            onPress={() => setTab(t)}
          >
            <Text
              className={`font-medium ${tab === t ? "text-primary-700" : "text-stone-400"}`}
            >
              {t === "borrowed" ? "Borrowed" : "Lent"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-stone-400 text-base">
                No {tab === "borrowed" ? "borrowed" : "lent"} items
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

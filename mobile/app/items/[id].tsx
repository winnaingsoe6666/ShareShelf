import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Shield, MessageSquare } from "lucide-react-native";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { formatPrice, formatDistance } from "@shareshelf/shared";
import type { Item, BorrowRequest, User } from "@shareshelf/shared";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState("");
  const [borrowStartDate, setBorrowStartDate] = useState("");
  const [borrowEndDate, setBorrowEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<BorrowRequest | null>(null);

  useEffect(() => {
    loadItem();
    getUser().then(setCurrentUser);
  }, [id]);

  async function loadItem() {
    try {
      const data = await api.items.getItem(Number(id));
      setItem(data);
      // Check for existing borrow request
      try {
        const borrows = await api.borrow.getBorrows(0, 100);
        const existing = borrows.content.find(
          (b) => b.itemId === data.id && b.status === "pending"
        );
        setExistingRequest(existing || null);
      } catch {
        // ignore
      }
    } catch {
      Alert.alert("Error", "Item not found");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrow() {
    if (!item) return;
    setSubmitting(true);
    try {
      await api.borrow.createBorrow({
        itemId: item.id,
        message: borrowMessage.trim() || undefined,
        startDate: borrowStartDate || undefined,
        endDate: borrowEndDate || undefined,
      });
      Alert.alert("Success", "Borrow request sent!");
      setShowBorrowModal(false);
      setBorrowMessage("");
      setBorrowStartDate("");
      setBorrowEndDate("");
      await loadItem();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!item) return null;

  const isOwner = currentUser?.id === item.ownerId;
  const imageUrl = item.imageUrls?.[0];

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Image */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-64" resizeMode="cover" />
        ) : (
          <View className="w-full h-64 bg-stone-100 items-center justify-center">
            <Text className="text-stone-400">No image</Text>
          </View>
        )}

        <View className="px-6 py-4">
          {/* Title & Status */}
          <View className="flex-row justify-between items-start">
            <Text className="text-2xl font-bold text-stone-800 flex-1">{item.title}</Text>
            <View
              className={`px-3 py-1 rounded-full ml-2 ${
                item.status === "available"
                  ? "bg-emerald-100"
                  : item.status === "borrowed"
                    ? "bg-amber-100"
                    : "bg-stone-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.status === "available"
                    ? "text-emerald-700"
                    : item.status === "borrowed"
                      ? "text-amber-700"
                      : "text-stone-500"
                }`}
              >
                {item.status}
              </Text>
            </View>
          </View>

          {/* Category */}
          {item.categoryName && (
            <Text className="text-stone-400 text-sm mt-1">{item.categoryName}</Text>
          )}

          {/* Price */}
          <View className="flex-row items-baseline mt-3">
            <Text className="text-2xl font-bold text-primary-700">
              {item.dailyPrice != null ? formatPrice(item.dailyPrice) : "Free"}
            </Text>
            {item.dailyPrice != null && (
              <Text className="text-stone-400 ml-1">/day</Text>
            )}
          </View>

          {item.depositAmount != null && (
            <Text className="text-stone-500 text-sm mt-1">
              Deposit: {formatPrice(item.depositAmount)}
            </Text>
          )}

          {/* Description */}
          {item.description && (
            <View className="mt-4">
              <Text className="font-semibold text-stone-700 mb-1">Description</Text>
              <Text className="text-stone-600 leading-5">{item.description}</Text>
            </View>
          )}

          {/* Location */}
          {item.distance != null && (
            <View className="flex-row items-center mt-3">
              <MapPin size={16} color="#78716c" />
              <Text className="text-stone-500 ml-1">{formatDistance(item.distance)}</Text>
            </View>
          )}

          {/* Owner info */}
          <View className="mt-6 bg-stone-50 rounded-xl p-4">
            <Text className="font-semibold text-stone-700 mb-2">Owner</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Text className="text-primary-700 font-bold">
                  {item.ownerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-stone-800">{item.ownerName}</Text>
                <View className="flex-row items-center mt-0.5">
                  <Shield size={14} color="#7c3aed" />
                  <Text className="text-stone-500 text-sm ml-1">
                    Trust: {item.ownerTrustScore?.toFixed(1) || "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          {!isOwner && item.status === "available" && (
            <View className="mt-6 gap-3">
              {existingRequest ? (
                <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <Text className="text-emerald-700 font-medium">
                    Request sent — waiting for owner response
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-primary-700 rounded-full py-4 items-center"
                  onPress={() => setShowBorrowModal(true)}
                >
                  <Text className="text-white font-semibold text-base">Request to Borrow</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="bg-stone-100 rounded-full py-4 items-center flex-row justify-center"
                onPress={() => {
                  if (currentUser) {
                    router.push(`/messages/${item.id}/${item.ownerId}`);
                  } else {
                    router.push("/login");
                  }
                }}
              >
                <MessageSquare size={18} color="#57534e" />
                <Text className="text-stone-700 font-medium ml-2">Message Owner</Text>
              </TouchableOpacity>
            </View>
          )}

          {isOwner && (
            <View className="mt-6">
              <Text className="text-stone-400 text-sm text-center">This is your listing</Text>
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-6">
            <Text className="text-xl font-bold text-stone-800 mb-4">Request to Borrow</Text>

            <Text className="text-sm font-medium text-stone-600 mb-1">Message (optional)</Text>
            <TextInput
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base mb-4"
              placeholder="Tell the owner why you need this..."
              value={borrowMessage}
              onChangeText={setBorrowMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#a8a29e"
            />

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-stone-600 mb-1">Start Date</Text>
                <TextInput
                  className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
                  placeholder="YYYY-MM-DD"
                  value={borrowStartDate}
                  onChangeText={setBorrowStartDate}
                  placeholderTextColor="#a8a29e"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-stone-600 mb-1">End Date</Text>
                <TextInput
                  className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
                  placeholder="YYYY-MM-DD"
                  value={borrowEndDate}
                  onChangeText={setBorrowEndDate}
                  placeholderTextColor="#a8a29e"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-stone-100 rounded-full py-4 items-center"
                onPress={() => setShowBorrowModal(false)}
              >
                <Text className="text-stone-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 bg-primary-700 rounded-full py-4 items-center ${submitting ? "opacity-60" : ""}`}
                onPress={handleBorrow}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium">Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, MapPin } from "lucide-react-native";
import { api } from "@/lib/api";
import { formatPrice, formatDistance } from "@shareshelf/shared";
import type { Item, Category, ItemQueryParams } from "@shareshelf/shared";

export default function BrowseScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const loadItems = useCallback(async (params?: ItemQueryParams) => {
    try {
      const data = await api.items.getItems({
        search: params?.search || undefined,
        categoryId: params?.categoryId,
        status: params?.status,
        page: 0,
        size: 50,
      });
      setItems(data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.category.getCategories().then(setCategories).catch(() => {});
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems({ search, categoryId: selectedCategory, status: selectedStatus });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStatus, loadItems]);

  async function onRefresh() {
    setRefreshing(true);
    await loadItems({ search, categoryId: selectedCategory, status: selectedStatus });
    setRefreshing(false);
  }

  function renderItem({ item }: { item: Item }) {
    const imageUrl = item.imageUrls?.[0];
    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm border border-stone-200 mb-3 overflow-hidden"
        onPress={() => router.push(`/items/${item.id}`)}
        activeOpacity={0.7}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-40" resizeMode="cover" />
        ) : (
          <View className="w-full h-40 bg-stone-100 items-center justify-center">
            <Text className="text-stone-400">No image</Text>
          </View>
        )}
        <View className="p-3">
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-semibold text-stone-800 flex-1" numberOfLines={1}>
              {item.title}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ml-2 ${
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
          {item.categoryName && (
            <Text className="text-xs text-stone-400 mt-1">{item.categoryName}</Text>
          )}
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-primary-700 font-bold">
              {item.dailyPrice != null ? `${formatPrice(item.dailyPrice)}/day` : "Free"}
            </Text>
            <Text className="text-xs text-stone-400">{item.ownerName}</Text>
          </View>
          {item.distance != null && (
            <View className="flex-row items-center mt-1">
              <MapPin size={12} color="#78716c" />
              <Text className="text-xs text-stone-400 ml-1">{formatDistance(item.distance)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-stone-50">
      {/* Search bar */}
      <View className="bg-white px-4 py-3 border-b border-stone-200">
        <View className="flex-row items-center bg-stone-100 rounded-full px-4 py-2">
          <Search size={18} color="#78716c" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search tools..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#a8a29e"
          />
        </View>
      </View>

      {/* Category chips */}
      <View className="bg-white py-2 border-b border-stone-200">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 0, name: "All" }, ...categories]}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => {
            const isSelected = item.id === 0 ? !selectedCategory : selectedCategory === item.id;
            return (
              <TouchableOpacity
                className={`px-3 py-1.5 rounded-full mr-2 ${
                  isSelected ? "bg-primary-700" : "bg-stone-100"
                }`}
                onPress={() => setSelectedCategory(item.id === 0 ? undefined : item.id)}
              >
                <Text className={`text-sm ${isSelected ? "text-white" : "text-stone-600"}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Status filter */}
      <View className="bg-white py-2 border-b border-stone-200 flex-row px-4 gap-2">
        {[
          { label: "All", value: undefined },
          { label: "Available", value: "available" },
          { label: "Borrowed", value: "borrowed" },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.label}
            className={`px-3 py-1 rounded-full ${
              selectedStatus === opt.value ? "bg-primary-700" : "bg-stone-100"
            }`}
            onPress={() => setSelectedStatus(opt.value)}
          >
            <Text className={`text-sm ${selectedStatus === opt.value ? "text-white" : "text-stone-600"}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items list */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-stone-400 text-base">No tools found</Text>
              <Text className="text-stone-300 text-sm mt-1">Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

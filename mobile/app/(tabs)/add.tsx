import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Category } from "@shareshelf/shared";

export default function AddItemScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) router.replace("/login");
    });
    api.category.getCategories().then(setCategories).catch(() => {});
  }, [router]);

  async function pickImages() {
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      Alert.alert(t("common.error"), t("add.maxImages"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 5));
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert(t("common.error"), t("add.titleRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const item = await api.items.createItem({
        title: title.trim(),
        description: description.trim() || undefined,
        dailyPrice: dailyPrice ? parseFloat(dailyPrice) : undefined,
        depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
        categoryId,
      });

      // Upload images if any
      if (images.length > 0 && item.id) {
        for (const uri of images) {
          try {
            const formData = new FormData();
            const filename = uri.split("/").pop() || "photo.jpg";
            const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
            const mimeType = ext === "png" ? "image/png" : "image/jpeg";
            formData.append("file", {
              uri,
              name: filename,
              type: mimeType,
            } as any);
            await api.items.uploadImage(item.id, formData);
          } catch {
            // Continue uploading other images
          }
        }
      }

      Alert.alert(t("common.success"), t("add.itemCreated"), [
        { text: "OK", onPress: () => router.push(`/items/${item.id}`) },
      ]);
    } catch (err: any) {
      Alert.alert(t("common.error"), err?.response?.data?.message || t("add.failedToCreate"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-stone-800 mb-6">{t("add.title")}</Text>

        {/* Images */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-2">{t("add.photos")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} className="mr-2 relative">
                <Image
                  source={{ uri }}
                  className="w-24 h-24 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  onPress={() => removeImage(index)}
                >
                  <X size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 items-center justify-center"
                onPress={pickImages}
              >
                <Camera size={24} color="#a8a29e" />
                <Text className="text-xs text-stone-400 mt-1">{t("add.addPhoto")}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">{t("add.titleLabel")}</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder={t("add.titlePlaceholder")}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">{t("add.descriptionLabel")}</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder={t("add.descriptionPlaceholder")}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-2">{t("add.categoryLabel")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`px-3 py-2 rounded-full mr-2 ${
                  categoryId === cat.id ? "bg-primary-700" : "bg-stone-100"
                }`}
                onPress={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
              >
                <Text
                  className={`text-sm ${categoryId === cat.id ? "text-white" : "text-stone-600"}`}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Price */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">{t("add.dailyPriceLabel")}</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder={t("add.dailyPricePlaceholder")}
            value={dailyPrice}
            onChangeText={setDailyPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Deposit */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-stone-600 mb-1">{t("add.depositLabel")}</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            placeholder={t("add.depositPlaceholder")}
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#a8a29e"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          className={`bg-primary-700 rounded-full py-4 items-center ${submitting ? "opacity-60" : ""}`}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t("add.createListing")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

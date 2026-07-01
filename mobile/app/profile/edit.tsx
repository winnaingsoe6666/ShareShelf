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
import { Camera } from "lucide-react-native";
import { api } from "@/lib/api";
import { getUser, updateUserSession } from "@/lib/auth";
import type { User } from "@shareshelf/shared";

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [community, setCommunity] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const u = await getUser();
    if (u) {
      setUser(u);
      setName(u.name || "");
      setBio(u.bio || "");
      setCommunity(u.community || "");
      setSocialLink(u.socialLink || "");
      setAddressLine1(u.addressLine1 || "");
      setAddressLine2(u.addressLine2 || "");
      setCity(u.city || "");
      setState(u.state || "");
      setZipCode(u.zipCode || "");
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await api.user.updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        community: community.trim() || undefined,
        socialLink: socialLink.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
      });

      // Update local session
      const sessionUser = {
        id: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        trustScore: updatedUser.trustScore,
        profileBonus: updatedUser.profileBonus,
        community: updatedUser.community,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        isIdVerified: updatedUser.isIdVerified,
        addressLine1: updatedUser.addressLine1,
        addressLine2: updatedUser.addressLine2,
        city: updatedUser.city,
        state: updatedUser.state,
        zipCode: updatedUser.zipCode,
        socialLink: updatedUser.socialLink,
      };
      await updateUserSession(sessionUser);

      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarPick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);

      try {
        const updatedUser = await api.user.uploadAvatar(formData);
        const sessionUser = {
          id: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
          trustScore: updatedUser.trustScore,
          profileBonus: updatedUser.profileBonus,
          community: updatedUser.community,
          avatarUrl: updatedUser.avatarUrl,
          bio: updatedUser.bio,
          isIdVerified: updatedUser.isIdVerified,
          addressLine1: updatedUser.addressLine1,
          addressLine2: updatedUser.addressLine2,
          city: updatedUser.city,
          state: updatedUser.state,
          zipCode: updatedUser.zipCode,
          socialLink: updatedUser.socialLink,
        };
        await updateUserSession(sessionUser);
        await loadUser();
        Alert.alert("Success", "Avatar updated!");
      } catch {
        Alert.alert("Error", "Failed to upload avatar");
      }
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        {/* Avatar */}
        <TouchableOpacity className="items-center mb-6" onPress={handleAvatarPick}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="w-24 h-24 rounded-full" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-700 text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-primary-700 w-8 h-8 rounded-full items-center justify-center">
            <Camera size={16} color="white" />
          </View>
          <Text className="text-primary-700 text-sm mt-2">Change Photo</Text>
        </TouchableOpacity>

        {/* Form fields */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Name *</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Bio</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholder="Tell others about yourself..."
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Community</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={community}
            onChangeText={setCommunity}
            placeholder="Your neighborhood"
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Social Link</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={socialLink}
            onChangeText={setSocialLink}
            placeholder="https://..."
            autoCapitalize="none"
            placeholderTextColor="#a8a29e"
          />
        </View>

        <Text className="text-base font-semibold text-stone-700 mt-4 mb-3">Address</Text>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Address Line 1</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Street address"
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-stone-600 mb-1">Address Line 2</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Apt, suite, etc."
            placeholderTextColor="#a8a29e"
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-stone-600 mb-1">City</Text>
            <TextInput
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#a8a29e"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-stone-600 mb-1">State</Text>
            <TextInput
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
              value={state}
              onChangeText={setState}
              placeholderTextColor="#a8a29e"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-stone-600 mb-1">Zip Code</Text>
          <TextInput
            className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-base"
            value={zipCode}
            onChangeText={setZipCode}
            placeholderTextColor="#a8a29e"
          />
        </View>

        <TouchableOpacity
          className={`bg-primary-700 rounded-full py-4 items-center ${saving ? "opacity-60" : ""}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

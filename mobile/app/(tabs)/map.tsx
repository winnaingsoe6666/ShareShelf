import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { api } from "@/lib/api";
import { formatPrice } from "@shareshelf/shared";
import type { Item } from "@shareshelf/shared";

// react-native-maps is native-only; skip on web
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
  } catch {
    // Maps not available
  }
}

const INITIAL_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function MapScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadLocation();
  }, []);

  async function loadLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(coords);
      await loadItems(coords);
    } catch {
      setError("Could not get location");
      setLoading(false);
    }
  }

  async function loadItems(coords: { lat: number; lng: number }) {
    try {
      const data = await api.items.getItems({
        nearLat: coords.lat,
        nearLng: coords.lng,
        nearRadius: 10000,
        size: 50,
      });
      setItems(data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-stone-50">
        <Text className="text-stone-500 text-center">{error}</Text>
      </View>
    );
  }

  // Web fallback — list view
  if (Platform.OS === "web" || !MapView) {
    return (
      <View className="flex-1 bg-stone-50">
        <View className="flex-1 px-4 pt-4">
          <Text className="text-lg font-bold text-stone-800 mb-3">
            {items.length} tools near you
          </Text>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-3 border border-stone-200"
              onPress={() => router.push(`/items/${item.id}`)}
            >
              <Text className="font-semibold text-stone-800">{item.title}</Text>
              <Text className="text-primary-700 font-bold mt-1">
                {item.dailyPrice != null ? `${formatPrice(item.dailyPrice)}/day` : "Free"}
              </Text>
              {item.distance != null && (
                <Text className="text-stone-400 text-sm mt-1">
                  {(item.distance / 1000).toFixed(1)} km away
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Native map view
  return (
    <View className="flex-1 bg-stone-50">
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location!.lat,
          longitude: location!.lng,
          ...INITIAL_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {items
          .filter((item) => item.latitude != null && item.longitude != null)
          .map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude!,
                longitude: item.longitude!,
              }}
              title={item.title}
              description={
                item.dailyPrice != null ? `${formatPrice(item.dailyPrice)}/day` : "Free"
              }
              onCalloutPress={() => router.push(`/items/${item.id}`)}
            />
          ))}
      </MapView>

      {/* Item count overlay */}
      <View className="absolute top-4 left-4 right-4">
        <View className="bg-white rounded-xl px-4 py-3 shadow-sm border border-stone-200">
          <Text className="text-sm font-medium text-stone-600">
            {items.length} tools near you
          </Text>
        </View>
      </View>
    </View>
  );
}

// Redirects to the add tab
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function NewItemScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/add");
  }, [router]);
  return null;
}

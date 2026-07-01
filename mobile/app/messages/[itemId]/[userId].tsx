import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { connectStomp, sendStompMessage, disconnectStomp } from "@/lib/websocket";
import type { ChatMessage, User } from "@shareshelf/shared";

export default function ChatScreen() {
  const { itemId, userId } = useLocalSearchParams<{ itemId: string; userId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await api.chat.getConversation(Number(itemId), Number(userId), 0, 100);
      setMessages(data.messages.reverse());
      await api.chat.markAsRead(Number(itemId), Number(userId));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [itemId, userId]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    getUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        // Connect STOMP and listen for incoming messages
        cleanup = connectStomp(user.id, (incoming: ChatMessage) => {
          // Only add messages for this conversation
          if (
            incoming.itemId === Number(itemId) &&
            (incoming.senderId === Number(userId) || incoming.receiverId === Number(userId))
          ) {
            setMessages((prev) => {
              // Deduplicate by id
              if (prev.some((m) => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
            // Mark as read if from the other user
            if (incoming.senderId === Number(userId)) {
              api.chat.markAsRead(Number(itemId), Number(userId)).catch(() => {});
            }
          }
        });
      }
    });

    loadMessages();

    return () => {
      cleanup?.();
      disconnectStomp();
    };
  }, [loadMessages, itemId, userId]);

  async function handleSend() {
    if (!message.trim() || !currentUser) return;
    const msgText = message.trim();
    setMessage("");
    setSending(true);

    try {
      // Send via STOMP WebSocket
      const sent = sendStompMessage({
        itemId: Number(itemId),
        receiverId: Number(userId),
        message: msgText,
      });

      if (!sent) {
        // Fallback: optimistic UI + reload
        const optimistic: ChatMessage = {
          id: Date.now(),
          senderId: currentUser.id,
          receiverId: Number(userId),
          itemId: Number(itemId),
          message: msgText,
          readAt: null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        await loadMessages();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isOwn = item.senderId === currentUser?.id;
    return (
      <View className={`mb-2 ${isOwn ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            isOwn ? "bg-primary-700 rounded-br-sm" : "bg-stone-100 rounded-bl-sm"
          }`}
        >
          <Text className={`text-base ${isOwn ? "text-white" : "text-stone-800"}`}>
            {item.message}
          </Text>
          <Text
            className={`text-xs mt-1 ${isOwn ? "text-primary-200" : "text-stone-400"}`}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isOwn && item.readAt ? " ✓✓" : isOwn ? " ✓" : ""}
          </Text>
        </View>
      </View>
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
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-stone-400">No messages yet. Say hello!</Text>
          </View>
        }
      />

      {/* Message input */}
      <View className="flex-row items-end px-4 py-3 border-t border-stone-200 bg-white">
        <TextInput
          className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-3 text-base mr-2"
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={2000}
          placeholderTextColor="#a8a29e"
        />
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center ${
            message.trim() ? "bg-primary-700" : "bg-stone-200"
          }`}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          <Send size={18} color={message.trim() ? "white" : "#a8a29e"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

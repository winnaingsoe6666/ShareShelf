import { Client, IMessage } from "@stomp/stompjs";
import { getToken } from "./auth";

const WS_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api")
  .replace("/api", "")
  .replace("http", "ws");

let stompClient: Client | null = null;

export function connectStomp(
  userId: number,
  onMessage: (msg: any) => void
): () => void {
  if (stompClient?.active) {
    disconnectStomp();
  }

  stompClient = new Client({
    brokerURL: `${WS_URL}/ws`,
    connectHeaders: {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      console.log("[WS] Connected");
      stompClient?.subscribe(`/topic/chat/${userId}`, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          onMessage(body);
        } catch (e) {
          console.warn("[WS] Failed to parse message", e);
        }
      });
    },
    onStompError: (frame) => {
      console.error("[WS] STOMP error:", frame.headers["message"]);
    },
    onDisconnect: () => {
      console.log("[WS] Disconnected");
    },
  });

  // Inject JWT token
  getToken().then((token) => {
    if (token && stompClient) {
      stompClient.connectHeaders = { Authorization: `Bearer ${token}` };
      stompClient.activate();
    }
  });

  return () => disconnectStomp();
}

export function sendStompMessage(payload: {
  itemId: number;
  receiverId: number;
  message: string;
}) {
  if (!stompClient?.active) {
    console.warn("[WS] Not connected, cannot send");
    return false;
  }
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
  return true;
}

export function disconnectStomp() {
  if (stompClient?.active) {
    stompClient.deactivate();
  }
  stompClient = null;
}

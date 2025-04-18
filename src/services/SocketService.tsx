import { SOCKET_URL } from "@/config";
import { Client } from "@stomp/stompjs";
import { EventEmitter } from "events";
import { Image } from "react-native-svg";

export const socketEvents = new EventEmitter();

const userId = "c670e06e-afa8-4d4f-8005-b7bea9b38054";// Replace with your actual WebSocket URL

let stompClient: Client;

export const connectToSocket = (greenhouseId: string) => {
  if (stompClient) {
    stompClient.deactivate();
  }

  stompClient = new Client({
    brokerURL: SOCKET_URL,
    connectHeaders: {
      Authorization: `Bearer ${userId}`,
    },
    webSocketFactory: () => {
      return new WebSocket(SOCKET_URL);
    },
    debug: (str) => {
      console.log("DEBUG: ",str);
    },
    onConnect: () => {
      console.log("✅ WebSocket connection established");

      // Subscribe to the greenhouse queue
      const subscription = stompClient.subscribe(
        `/queue/greenhouse/${userId}`,
        (message ) => {
          try {
            const data = JSON.parse(message.body);
            console.log("Received message:", data);
            socketEvents.emit("message", data);
          } catch (error) {
            console.error("Error parsing socket message:", error);
          }
        }
      );
      console.log("Subscription:", subscription);

      if (subscription) {
        console.log("✅ Subscribed to greenhouse queue");
      } else {
        console.error("❌ Failed to subscribe to greenhouse queue");
      }

      // Send initial subscription message
      const payload = {
        userId: userId,
        greenhouseIds: [greenhouseId],
      };

      var checking=stompClient.publish({
        destination: "/app/subscribe",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify(payload),
      });
      console.log("Publish result:", checking);
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
      socketEvents.emit("error", frame);
    },
    onWebSocketClose: () => {
      console.log("❌ WebSocket connection closed");
      socketEvents.emit("close");
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
    },
    onDisconnect: () => {
      console.warn("⚠️ WebSocket disconnected.");
      stompClient.publish({
        destination: "/app/unsubscribe",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ userId, greenhouseIds: [greenhouseId] }),
      });
    }
  });

  stompClient.activate();
};

export const disconnectFromSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};

export const sendSocketMessage = (message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/message",
      body: JSON.stringify(message),
    });
  } else {
    console.error("WebSocket is not connected");
  }
};

export const getSocketClient = () => {
  return stompClient;
};
export const getSocketEvents = () => {
  return socketEvents;
}

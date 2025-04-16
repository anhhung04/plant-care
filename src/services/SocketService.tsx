// import { SOCKET_URL } from "@/config";
// import { Client } from "@stomp/stompjs";
// import { EventEmitter } from "events";

// export const socketEvents = new EventEmitter();

// const userId = "c670e06e-afa8-4d4f-8005-b7bea9b38054";// Replace with your actual WebSocket URL

// let stompClient: Client;

// export const connectToSocket = (greenhouseId: string) => {
//   console.log("Connecting to WebSocket...");

//   if (stompClient) {
//     stompClient.deactivate();
//   }

//   stompClient = new Client({
//     brokerURL: SOCKET_URL,
//     connectHeaders: {
//       Authorization: `Bearer ${userId}`,
//     },
//     debug: (str) => {
//       console.log(str);
//     },
//     onConnect: () => {
//       console.log("✅ WebSocket connection established");

//       // Subscribe to the greenhouse queue
//       const subscription = stompClient?.subscribe(
//         `/queue/greenhouse/${userId}`,
//         (message) => {
//           try {
//             const data = JSON.parse(message.body);
//             console.log("Received message:", data);
//             socketEvents.emit("message", data);
//           } catch (error) {
//             console.error("Error parsing socket message:", error);
//           }
//         }
//       );

//       if (subscription) {
//         console.log("✅ Subscribed to greenhouse queue");
//       } else {
//         console.error("❌ Failed to subscribe to greenhouse queue");
//       }

//       // Send initial subscription message
//       const payload = {
//         userId: userId,
//         greenhouseIds: [greenhouseId],
//       };

//       stompClient?.publish({
//         destination: "/app/subscribe",
//         headers: {
//           Authorization: `Bearer ${userId}`,
//         },
//         body: JSON.stringify(payload),
//       });
//     },
//     onStompError: (frame: IFrame) => {
//       console.error("❌ STOMP error:", frame);
//       socketEvents.emit("error", frame);
//     },
//     onWebSocketClose: () => {
//       console.log("WebSocket connection closed");
//       socketEvents.emit("close");
//     },
//   });

//   stompClient.activate();
// };

// export const disconnectFromSocket = () => {
//   if (stompClient) {
//     stompClient.deactivate();
//     stompClient = null;
//   }
// };

// export const sendSocketMessage = (message: any) => {
//   if (stompClient && stompClient.connected) {
//     stompClient.publish({
//       destination: "/app/message",
//       body: JSON.stringify(message),
//     });
//   } else {
//     console.error("WebSocket is not connected");
//   }
// };

import { Client, IMessage } from "@stomp/stompjs";
import WebSocket from "ws"; // Import WebSocket from ws

// User ID (usually provided by JWT or backend)
const userId = "c670e06e-afa8-4d4f-8005-b7bea9b38054";

const stompClient = new Client({
  // If your application's context is /mobileBE, keep the brokerURL as follows:
  brokerURL: "ws://localhost:8080/mobileBE/ws",
  connectHeaders: {
    Authorization: `Bearer ${userId}`,
  },
  // Use webSocketFactory to create a WebSocket connection
  webSocketFactory: () => new WebSocket("ws://localhost:8080/mobileBE/ws"),
  debug: (str: string) => {
    console.log(str);
  },
  onConnect: () => {
    console.log("✅ WebSocket connection established!");

    // ★ Note: With Spring configuration (setUserDestinationPrefix("/user")),
    // the client needs to subscribe to "/user/queue/greenhouse" (no need to add userId to the path)
    const subscription = stompClient.subscribe(
      `/queue/greenhouse/${userId}`,
      (message: IMessage) => {
        console.log("📩 Received message from server:", message.body);
      }
    );

    if (subscription) {
      console.log(subscription);
      console.log("✅ Successfully subscribed!");
    } else {
      console.error("❌ Failed to subscribe.");
    }

    // Send a subscription request so the backend recognizes this user wants to receive real-time data
    const payload = {
      userId: userId,
      greenhouseIds: ["gh_6e69294a8d1943819ff4f69933837bef"],
    };

    stompClient.publish({
      destination: "/app/subscribe",
      headers: {
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify(payload),
    });
  },
  onStompError: (frame) => {
    console.error("❌ STOMP error:", frame);
  },
});

// Activate the WebSocket client
export const connectToSocket = (greenhouseId: string ) => {
  stompClient.activate();
}

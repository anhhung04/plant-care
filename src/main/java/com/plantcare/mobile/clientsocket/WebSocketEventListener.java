package com.plantcare.mobile.clientsocket;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;

@Component
public class WebSocketEventListener {
    private final ClientSocketSessionRegistry clientSocketSessionRegistry;

    public WebSocketEventListener(ClientSocketSessionRegistry clientSocketSessionRegistry) {
        this.clientSocketSessionRegistry = clientSocketSessionRegistry;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String token = headerAccessor.getFirstNativeHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            //O day minh se pass token vao userId nha, gio chua co detail cua token nen tam thoi de random nhe'
//            UUID userId = UUID.fromString(token);
            String userId= "c670e06e-afa8-4d4f-8005-b7bea9b38054";
            clientSocketSessionRegistry.addConnectedUser(userId);
            System.out.println("User connected: " + userId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String token = headerAccessor.getFirstNativeHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            //O day minh se pass token vao userId nha, gio chua co detail cua token nen tam thoi de random nhe'
//            UUID userId = UUID.fromString(token);
            String userId= "c670e06e-afa8-4d4f-8005-b7bea9b38054";
            clientSocketSessionRegistry.removeConnectedUser(userId);
            System.out.println("User disconnected: " + userId);
        }
    }
}

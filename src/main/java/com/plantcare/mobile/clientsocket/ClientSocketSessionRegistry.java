package com.plantcare.mobile.clientsocket;

import com.plantcare.mobile.exception.AppException;
import com.plantcare.mobile.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;


@Component
@Slf4j
public class ClientSocketSessionRegistry {
    private final Set<UUID> connectedUsers = ConcurrentHashMap.newKeySet();
    private final Map<UUID, List<UUID>> gardenSubscriptions = new ConcurrentHashMap<>();

    // Thêm user vào danh sách user đã kết nối socket
    public void addConnectedUser(UUID userId) {
        connectedUsers.add(userId);
    }

    // Xóa user khỏi danh sách user đang kết nối
    public void removeConnectedUser(UUID userId) {
        connectedUsers.remove(userId);
        // Xóa user khỏi tất cả subscriptions
        gardenSubscriptions.values().forEach(list -> list.remove(userId));
    }

    // Thêm userId vào danh sách sub greenhouseId
    public void subscribe(UUID userId, UUID greenhouseId) {
        gardenSubscriptions.computeIfAbsent(greenhouseId, k -> new CopyOnWriteArrayList<>()).add(userId);
    }

    // Unsub greenhouseID mà user đã theo dõi
    public void unsubscribe(UUID userId, UUID greenhouseId) {

        try {
            gardenSubscriptions.get(greenhouseId).remove(userId);
        }
        catch (NullPointerException e) {
            log.info(e.getMessage());
            throw new AppException(ErrorCode.CANNOT_UNSUB_SOCKET);
        }

    }

    // Unsub tất cả greenhouse mà user đang theo dõi
    public void unsubscribeAll(UUID userId) {
        gardenSubscriptions.values().forEach(list -> list.remove(userId));
    }

    // Lấy danh sách userId đang subscribe greenhouseId
    public List<UUID> getSubscribers(UUID greenhouseId) {
        return gardenSubscriptions.getOrDefault(greenhouseId, Collections.emptyList());
    }

    // Lấy danh sách tất cả user đang kết nối
    public Set<UUID> getConnectedUsers() {
        return connectedUsers;
    }

    // Lấy danh sách tất cả greenhouse mà user đang subscribe
    public Map<UUID, List<UUID>> getSubscriptions() {
        return gardenSubscriptions;
    }
}
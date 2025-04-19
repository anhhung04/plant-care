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
    private final Set<String> connectedUsers = ConcurrentHashMap.newKeySet();
    private final Map<String, List<String>> gardenSubscriptions = new ConcurrentHashMap<>();

    // Thêm user vào danh sách user đã kết nối socket
    public void addConnectedUser(String userId) {
        connectedUsers.add(userId);
    }

    // Xóa user khỏi danh sách user đang kết nối
    public void removeConnectedUser(String userId) {
        connectedUsers.remove(userId);
        // Xóa user khỏi tất cả subscriptions
        gardenSubscriptions.values().forEach(list -> list.remove(userId));
    }

    // Thêm userId vào danh sách sub greenhouseId
    public void subscribe(String userId, String greenhouseId) {
        gardenSubscriptions.computeIfAbsent(greenhouseId, k -> new CopyOnWriteArrayList<>()).add(userId);
    }

    // Unsub greenhouseID mà user đã theo dõi
    public void unsubscribe(String userId, String greenhouseId) {

        try {
            gardenSubscriptions.get(greenhouseId).remove(userId);
        }
        catch (NullPointerException e) {
            log.info(e.getMessage());
            throw new AppException(ErrorCode.CANNOT_UNSUB_SOCKET);
        }

    }

    // Unsub tất cả greenhouse mà user đang theo dõi
    public void unsubscribeAll(String userId) {
        gardenSubscriptions.values().forEach(list -> list.remove(userId));
    }

    // Lấy danh sách userId đang subscribe greenhouseId
    public List<String> getSubscribers(String greenhouseId) {
        return gardenSubscriptions.getOrDefault(greenhouseId, Collections.emptyList());
    }

    // Lấy danh sách tất cả user đang kết nối
    public Set<String> getConnectedUsers() {
        return connectedUsers;
    }

    // Lấy danh sách tất cả greenhouse mà user đang subscribe
    public Map<String, List<String>> getSubscriptions() {
        return gardenSubscriptions;
    }
}
package com.plantcare.mobile.notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.plantcare.mobile.config.FireBaseConfig;
import com.plantcare.mobile.notification.dto.request.NotificationCreationRequest;
import com.plantcare.mobile.notification.dto.response.NotificationResponse;
import com.plantcare.mobile.notification.entity.FCMToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.plantcare.mobile.notification.entity.Notification;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FireBaseMessagingService {

    @Autowired
    private FireBaseConfig fireBaseConfig;

    @Autowired
    private FcmService fcmService;

    public NotificationResponse sendNotification(NotificationCreationRequest request) {
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .timestamp(Timestamp.now())
                .read(false)
                .id(UUID.randomUUID().toString())
                .build();

        Message message = Message.builder()
                .putData("title", notification.getTitle())
                .putData("content", notification.getContent())
                .putData("timestamp", notification.getTimestamp().toString())
                .putData("id", notification.getId())
                .putData("read", String.valueOf(notification.isRead()))
                .setTopic("plantcare")
                .build();
        try {
            List<FCMToken> tokens = fcmService.getAllTokens();
            log.info("Tokens retrieved: {}", tokens);
            for (FCMToken token : tokens) {
                if (token.getToken() != null ) { // Validate token format
                    log.info("Sending notification to token: {}", token.getToken());
                    Message messageWithToken = Message.builder()
                            .putData("title", notification.getTitle())
                            .putData("content", notification.getContent())
                            .putData("timestamp", notification.getTimestamp().toString())
                            .putData("id", notification.getId())
                            .putData("read", String.valueOf(notification.isRead()))
                            .setTopic("plantcare")
                            .setToken(token.getToken())
                            .build();
                    fireBaseConfig.firebaseMessaging().send(messageWithToken);
                } else {
                    log.warn("Skipping notification for null or empty token");
                }
            }
            log.info("Notification sent successfully: {}");
            // Save notification to Firestore
//            Firestore firestore = fireBaseConfig.firestore();
//            firestore.collection("notifications").document(notification.getId()).set(notification);
            return NotificationResponse.builder()
                    .id(notification.getId())
                    .title(notification.getTitle())
                    .content(notification.getContent())
                    .timestamp(notification.getTimestamp())
                    .read(notification.isRead())
                    .build();

        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage());
            return null;
        }
    }

    public NotificationResponse getNotificationById(String id) {
        try {
            Firestore firestore = fireBaseConfig.firestore();
            Notification notification = firestore.collection("notifications").document(id).get().get().toObject(Notification.class);
            if (notification != null) {
                return NotificationResponse.builder()
                        .id(notification.getId())
                        .title(notification.getTitle())
                        .content(notification.getContent())
                        .timestamp(notification.getTimestamp())
                        .read(notification.isRead())
                        .build();
            } else {
                log.error("Notification not found with id: {}", id);
                return null;
            }
        } catch (Exception e) {
            log.error("Error retrieving notification: {}", e.getMessage());
            return null;
        }
    }
}

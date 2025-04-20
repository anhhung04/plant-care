package com.plantcare.mobile.notification;

import com.google.cloud.Timestamp;
import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.notification.dto.request.FCMregister;
import com.plantcare.mobile.notification.dto.request.NotificationCreationRequest;
import com.plantcare.mobile.notification.dto.response.NotificationResponse;
import com.plantcare.mobile.notification.entity.FCMToken;
import com.plantcare.mobile.notification.repository.FcmTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final ExpoPushService expoPushService;
    private final FcmTokenRepository repo;
    @PostMapping
    public ApiResponse<NotificationResponse> sendNotification(@RequestBody NotificationCreationRequest request) {
        log.info("Received notification request: {}", request);

        // Gọi service gửi notification
        expoPushService.sendNotifications(request.getTitle(), request.getContent());

        // Tạo response để trả về client
        NotificationResponse response = NotificationResponse.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getTitle())
                .content(request.getContent())
                .timestamp(Timestamp.now())
                .read(false)
                .build();

        return ApiResponse.<NotificationResponse>builder()
                .status(HttpStatusCode.valueOf(200))
                .message("Notification sent successfully")
                .data(response)
                .build();
    }

    @PostMapping("/register-token")
    public ApiResponse<String> registerToken(@RequestBody FCMregister req) {
        // upsert token
        log.info("Received token registration request: {}", req);
        FCMToken existingToken = repo.findByToken(req.getToken());
        if (existingToken != null) {
            log.warn("Token already exists: {}", req.getToken());
            return ApiResponse.<String>builder()
                    .status(HttpStatusCode.valueOf(400))
                    .message("Token already exists")
                    .data("Token already exists")
                    .build();
        }


        return ApiResponse.<String>builder()
                .status(HttpStatusCode.valueOf(200))
                .message("Token registered successfully")
                .data("Token registered successfully")
                .build();
    }
}

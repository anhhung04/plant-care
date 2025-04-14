package com.plantcare.mobile.notification;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.notification.dto.request.NotificationCreationRequest;
import com.plantcare.mobile.notification.dto.response.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final FireBaseMessagingService notificationService;


    @PostMapping
    public ApiResponse<NotificationResponse> sendNotification(@RequestBody NotificationCreationRequest request) {
        log.info("Received notification request: {}", request);
        NotificationResponse response = notificationService.sendNotification(request);
        if (response != null) {
            return ApiResponse.<NotificationResponse>builder()
                    .status(HttpStatusCode.valueOf(200))
                    .message("Notification sent successfully")
                    .data(response)
                    .build();
        } else {
            return ApiResponse.<NotificationResponse>builder()
                    .status(HttpStatusCode.valueOf(500))
                    .message("Failed to send notification")
                    .data(null)
                    .build();
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> getNotificationById(@PathVariable String id) {
        log.info("Received request to get notification by ID: {}", id);
        NotificationResponse response = notificationService.getNotificationById(id);
        if (response != null) {
            return ApiResponse.<NotificationResponse>builder()
                    .status(HttpStatusCode.valueOf(200))
                    .message("Notification retrieved successfully")
                    .data(response)
                    .build();
        } else {
            return ApiResponse.<NotificationResponse>builder()
                    .status(HttpStatusCode.valueOf(404))
                    .message("Notification not found")
                    .data(null)
                    .build();
        }
    }
}

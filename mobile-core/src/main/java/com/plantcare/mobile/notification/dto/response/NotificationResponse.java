package com.plantcare.mobile.notification.dto.response;

import com.google.cloud.Timestamp;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String title;
    private String content;
    private Timestamp timestamp;
    private boolean read;
}
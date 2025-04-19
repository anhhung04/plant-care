package com.plantcare.mobile.notification.dto.request;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationCreationRequest {
    private String title;
    private String content;

}
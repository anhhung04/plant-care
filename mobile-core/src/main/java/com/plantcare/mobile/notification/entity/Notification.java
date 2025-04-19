package com.plantcare.mobile.notification.entity;

import com.google.cloud.Timestamp;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Notification {
    private String id;
    private String title;
    private String content;
    private Timestamp timestamp;
    private boolean read;

}
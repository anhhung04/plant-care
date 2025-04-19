package com.plantcare.mobile.notification.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FCMregister {
    private String token;
    private String userId;
}
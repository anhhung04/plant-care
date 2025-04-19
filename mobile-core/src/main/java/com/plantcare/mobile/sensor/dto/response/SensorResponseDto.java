package com.plantcare.mobile.sensor.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SensorResponseDto {
    private String id;
    private String name;
    private String value;
    private boolean isEnabled;
}

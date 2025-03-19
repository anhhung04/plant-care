package com.plantcare.mobile.greenhouses.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseResponse {
    private UUID greenhouseId;

    private String userId;
    private String name;
    private String location;
    private Boolean status;
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}

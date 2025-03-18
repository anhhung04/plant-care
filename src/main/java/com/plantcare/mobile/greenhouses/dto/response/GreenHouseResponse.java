package com.plantcare.mobile.greenhouses.dto.response;

import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

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

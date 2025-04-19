package com.plantcare.mobile.greenhouses.dto.response;

import lombok.*;
import org.springframework.data.jpa.repository.Meta;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseFieldResponse {
    private int fieldIndex;
    private Metadata metadata;
}

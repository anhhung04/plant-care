package com.plantcare.mobile.greenhouses.dto.response;

import com.plantcare.mobile.dtoGlobal.Field;
import com.plantcare.mobile.dtoGlobal.Sensor;
import com.plantcare.mobile.dtoGlobal.Sensors;
import lombok.*;
import org.springframework.data.jpa.repository.Meta;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseFieldResponse {
    private int fieldIndex;
    private Sensors sensors;
    private Metadata metadata;
}

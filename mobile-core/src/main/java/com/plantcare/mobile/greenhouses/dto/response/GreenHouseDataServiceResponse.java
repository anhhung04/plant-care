package com.plantcare.mobile.greenhouses.dto.response;

import com.plantcare.mobile.dtoGlobal.Field;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseDataServiceResponse {
    private String greenhouse_id;
    private String name;
    private String location;
    private String owner;
    private List<Field> fields;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private Map<String, Object> metadata;
}
package com.plantcare.mobile.dtoGlobal;

import lombok.*;

import java.util.Map;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Field {
    private int field_index;
    private Sensors sensors;
    private Map<String, Object> metadata;
}
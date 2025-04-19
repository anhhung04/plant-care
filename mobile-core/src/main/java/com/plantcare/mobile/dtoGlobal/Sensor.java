package com.plantcare.mobile.dtoGlobal;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Sensor {
    private double value;
    private String unit;
    private LocalDateTime timestamp;
}
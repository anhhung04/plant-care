package com.plantcare.mobile.dtoGlobal;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Field {
    private List<Sensor> temperature_sensor;
    private List<Sensor> humidity_sensor;
    private List<Sensor> soil_moisture_sensor;
    private List<Sensor> light_sensor;
    private List<SensorStatus> fan_status;
    private List<SensorStatus> led_status;
    private List<SensorStatus> pump_status;
}
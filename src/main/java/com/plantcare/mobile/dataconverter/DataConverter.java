package com.plantcare.mobile.dataconverter;

import com.plantcare.mobile.dtoGlobal.Field;
import com.plantcare.mobile.dtoGlobal.Sensor;
import com.plantcare.mobile.dtoGlobal.SensorStatus;
import com.plantcare.mobile.dtoGlobal.Sensors;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseDataServiceResponse;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseFieldResponse;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * This class is responsible for converting the data from the GreenHouseDataServiceResponse
 * to the format that is needed for the application.
 */
@Component
public class DataConverter {

    public GreenHouseDataServiceResponse getFieldsRecent(GreenHouseDataServiceResponse needToConvert){
        List<Field> fields = needToConvert.getFields();
        if (fields == null || fields.isEmpty()) {
            return needToConvert;
        }
//        public class Field {
//            private List<Sensor> temperature_sensor;
//            private List<Sensor> humidity_sensor;
//            private List<Sensor> soil_moisture_sensor;
//            private List<Sensor> light_sensor;
//            private List<SensorStatus> fan_status;
//            private List<SensorStatus> led_status;
//            private List<SensorStatus> pump_status;
//        }
        for (Field field : fields) {
            if (field.getTemperature_sensor() != null && !field.getTemperature_sensor().isEmpty()) {
                field.setTemperature_sensor(
                        field.getTemperature_sensor().stream()
                                .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getHumidity_sensor() != null && !field.getHumidity_sensor().isEmpty()) {
                field.setHumidity_sensor(
                        field.getHumidity_sensor().stream()
                                .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getSoil_moisture_sensor() != null && !field.getSoil_moisture_sensor().isEmpty()) {
                field.setSoil_moisture_sensor(
                        field.getSoil_moisture_sensor().stream()
                                .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getLight_sensor() != null && !field.getLight_sensor().isEmpty()) {
                field.setLight_sensor(
                        field.getLight_sensor().stream()
                                .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getFan_status() != null && !field.getFan_status().isEmpty()) {
                field.setFan_status(
                        field.getFan_status().stream()
                                .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getLed_status() != null && !field.getLed_status().isEmpty()) {
                field.setLed_status(
                        field.getLed_status().stream()
                                .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
            if (field.getPump_status() != null && !field.getPump_status().isEmpty()) {
                field.setPump_status(
                        field.getPump_status().stream()
                                .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                                .limit(1)
                                .toList()
                );
            }
        }
        return needToConvert;
    }
    public GreenHouseFieldResponse getFieldRecent(GreenHouseFieldResponse needToConvert) {
        Sensors field = needToConvert.getSensors();
        if (field == null) {
            return needToConvert;
        }
        if (field.getTemperature_sensor() != null && !field.getTemperature_sensor().isEmpty()) {
            field.setTemperature_sensor(
                    field.getTemperature_sensor().stream()
                            .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getHumidity_sensor() != null && !field.getHumidity_sensor().isEmpty()) {
            field.setHumidity_sensor(
                    field.getHumidity_sensor().stream()
                            .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getSoil_moisture_sensor() != null && !field.getSoil_moisture_sensor().isEmpty()) {
            field.setSoil_moisture_sensor(
                    field.getSoil_moisture_sensor().stream()
                            .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getLight_sensor() != null && !field.getLight_sensor().isEmpty()) {
            field.setLight_sensor(
                    field.getLight_sensor().stream()
                            .sorted(Comparator.comparing(Sensor::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getFan_status() != null && !field.getFan_status().isEmpty()) {
            field.setFan_status(
                    field.getFan_status().stream()
                            .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getLed_status() != null && !field.getLed_status().isEmpty()) {
            field.setLed_status(
                    field.getLed_status().stream()
                            .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        if (field.getPump_status() != null && !field.getPump_status().isEmpty()) {
            field.setPump_status(
                    field.getPump_status().stream()
                            .sorted(Comparator.comparing(SensorStatus::getTimestamp).reversed())
                            .limit(1)
                            .toList()
            );
        }
        return needToConvert;
    }
}

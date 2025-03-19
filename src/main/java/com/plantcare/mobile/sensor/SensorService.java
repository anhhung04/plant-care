package com.plantcare.mobile.sensor;

import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.plantcare.mobile.sensor.dto.request.UpdateSensorDto;
import com.plantcare.mobile.sensor.entities.Sensor;

@Service
public class SensorService {

    @Autowired
    private SensorRepository sensorRepository;

    public List<Sensor> getAllSensors() {
        return sensorRepository.getAll();
    }

    public Sensor getSensorById(String id) {
        return sensorRepository.get(id);
    }

    public Sensor updateSensor(String id, UpdateSensorDto dto) {
        Document updateFields = new Document();

        if (dto.getName() != null) {
            updateFields.append("name", dto.getName());
        }
        if (dto.getValue() != null) {
            updateFields.append("value", dto.getValue());
        }
        return sensorRepository.update(id, updateFields);
    }

    public boolean enableSensor(String id) {
        return sensorRepository.enable(id);
    }

    public boolean disableSensor(String id) {
        return sensorRepository.disable(id);
    }
}

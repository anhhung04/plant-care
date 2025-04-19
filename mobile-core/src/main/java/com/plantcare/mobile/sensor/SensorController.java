package com.plantcare.mobile.sensor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.sensor.dto.request.UpdateSensorDto;
import com.plantcare.mobile.sensor.entities.Sensor;

@RestController
@RequestMapping("/sensors")
public class SensorController {

    @Autowired
    private SensorService sensorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sensor>>> getAllSensors() {
        ApiResponse response = new ApiResponse<List<Sensor>>(HttpStatus.OK, "OK", true, sensorService.getAllSensors());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sensor>> getSensor(@PathVariable String id) {
        Sensor sensor = sensorService.getSensorById(id);
        ApiResponse response = new ApiResponse<Sensor>(HttpStatus.OK, "OK", true, sensor);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Sensor>> updateSensor(@PathVariable String id, @RequestBody UpdateSensorDto dto) {
        Sensor updatedSensor = sensorService.updateSensor(id, dto);
        if (updatedSensor == null) {
            ApiResponse response = new ApiResponse<Sensor>(HttpStatus.NOT_FOUND, "NOT FOUND SENSOR", false, null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
        ApiResponse response = new ApiResponse<Sensor>(HttpStatus.OK, "OK", true, updatedSensor);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<ApiResponse<Boolean>> enableSensor(@PathVariable String id) {
        boolean updatedResult = sensorService.enableSensor(id);
        ApiResponse response = new ApiResponse<Boolean>(HttpStatus.OK, "OK", true, updatedResult);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Boolean>> deactivateSensor(@PathVariable String id) {
        boolean updatedResult = sensorService.disableSensor(id);
        ApiResponse response = new ApiResponse<Boolean>(HttpStatus.OK, "OK", true, updatedResult);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}

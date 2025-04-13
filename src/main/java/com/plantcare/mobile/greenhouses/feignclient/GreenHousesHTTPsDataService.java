package com.plantcare.mobile.greenhouses.feignclient;


import com.plantcare.mobile.dtoGlobal.Action;
import com.plantcare.mobile.dtoGlobal.Device;
import com.plantcare.mobile.dtoGlobal.Field;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseDataServiceCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseDataServiceResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name="greenhouses-data-service", url = "http://104.214.177.9:8000/api/v1/greenhouses")
public interface GreenHousesHTTPsDataService {
    @PostMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    GreenHouseDataServiceResponse createGreenhouse(@RequestBody GreenHouseDataServiceCreateRequest request);


    @GetMapping(value = "",produces = MediaType.APPLICATION_JSON_VALUE)
    List<GreenHouseDataServiceResponse> getGreenhouses(@RequestParam String owner,
                                                       @RequestParam String location,
                                                       @RequestParam int offset,
                                                       @RequestParam int limit);

    @GetMapping(value = "{greenhouse_id}",produces = MediaType.APPLICATION_JSON_VALUE)
    GreenHouseDataServiceResponse getGreenhouse(@RequestParam String greenhouse_id);

    @DeleteMapping(value = "/{greenhouse_id}", produces = MediaType.APPLICATION_JSON_VALUE)
    String deleteGreenhouse(@PathVariable String greenhouse_id);

    @PostMapping(value = "/{greenhouse_id}/fields", produces = MediaType.APPLICATION_JSON_VALUE)
    Field createField(
            @PathVariable String greenhouse_id,
            @RequestBody Field field
    );

    @GetMapping(value = "/{greenhouse_id}/fields", produces = MediaType.APPLICATION_JSON_VALUE)
    List<Field> getFields(@PathVariable String greenhouse_id);

    @GetMapping(value = "/{greenhouse_id}/fields/{field_index}", produces = MediaType.APPLICATION_JSON_VALUE)
    Field getField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    );

    @DeleteMapping(value = "/{greenhouse_id}/fields/{field_index}", produces = MediaType.APPLICATION_JSON_VALUE)
    String deleteField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    );

    @GetMapping(value = "/{greenhouse_id}/fields/{field_index}/history", produces = MediaType.APPLICATION_JSON_VALUE)
    Object getFieldHistory(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index,
            @RequestParam String sensor_type,
            @RequestParam String start_time,
            @RequestParam String end_time
    );

    @PostMapping(value = "/{greenhouse_id}/fields/{field_index}/control",consumes = MediaType.APPLICATION_JSON_VALUE,  produces = MediaType.APPLICATION_JSON_VALUE)
    String controlFieldDevice(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index,
            @RequestParam Device device,
            @RequestParam Action action
    );

}

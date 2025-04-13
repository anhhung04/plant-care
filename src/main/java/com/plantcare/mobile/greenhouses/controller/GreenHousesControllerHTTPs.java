package com.plantcare.mobile.greenhouses.controller;

import java.util.List;

import com.plantcare.mobile.dtoGlobal.Action;
import com.plantcare.mobile.dtoGlobal.Device;
import com.plantcare.mobile.dtoGlobal.Field;
import com.plantcare.mobile.exception.AppException;
import com.plantcare.mobile.exception.ErrorCode;
import com.plantcare.mobile.greenhouses.service.GreenHousesService;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseDataServiceCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseDataServiceResponse;
import com.plantcare.mobile.greenhouses.feignclient.GreenHousesHTTPsDataService;
import org.apache.logging.log4j.util.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/greenhouses")
@Slf4j
public class GreenHousesControllerHTTPs {
    private final GreenHousesService greenHousesService;
    private GreenHousesHTTPsDataService greenHousesHTTPsDataService;
    @Value("${security.prepared-key}")
    private String presharedKey;

    public GreenHousesControllerHTTPs(GreenHousesService greenHousesService, GreenHousesHTTPsDataService greenHousesHTTPsDataService)  {
        this.greenHousesService = greenHousesService;
        this.greenHousesHTTPsDataService = greenHousesHTTPsDataService;

    }

    @GetMapping()
    public ApiResponse<Page<GreenHouseResponse>> getGreenHouses(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return buildResponse(
                greenHousesService.getGreenHouse(name, page, size),
                "get greenhouses successful"
        );
    }

    @GetMapping("/update/{greenhouses_id}")
    public ApiResponse<GreenHouseResponse> updateGreenHouses(
            @RequestHeader("X-Auth-Key") String authKey,
            @PathVariable String greenhouses_id) {
        if (!authKey.equals(presharedKey)) {
            log.info("update greenhouses failed, auth key not match: {}", authKey);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return buildResponse(
                greenHousesService.updateGreenHouses(greenhouses_id),
                "update greenhouses successful"
        );
    }

    @PostMapping("/create")
    public ApiResponse<GreenHouseResponse> create(@RequestBody GreenHouseCreateRequest greenHouseCreateRequest) {
        return buildResponse(
                greenHousesService.createGreenHouse(greenHouseCreateRequest),
                "create greenhouse successful"
        );
    }


    @Transactional
    @PostMapping(value = "/ds-create", consumes = "application/json", produces = "application/json")
    public ApiResponse<GreenHouseResponse> createGreenhouse(@RequestBody GreenHouseDataServiceCreateRequest request) {
        GreenHouseDataServiceResponse response = safeExecute(
                () -> greenHousesHTTPsDataService.createGreenhouse(request),
                "Create greenhouse failed"
        );
        GreenHouseCreateRequest createRequest = mapToCreateRequest(response);
        return buildResponse(
                greenHousesService.createGreenHouse(createRequest),
                "Create greenhouse successful"
        );
    }

    @Transactional
    @GetMapping(value = "/ds-get", consumes = "application/json",produces = "application/json")
    public ApiResponse<List<GreenHouseResponse>> getGreenhouse(
            @RequestParam String owner,
            @RequestParam String location,
            @RequestParam Integer offset,
            @RequestParam Integer limit) {
        List<GreenHouseDataServiceResponse> greenhouse = greenHousesHTTPsDataService.getGreenhouses(
                owner,
                location,
                offset,
                limit
        );
        if (greenhouse == null) {
            log.info(
                    "get greenhouse failed, data service not response or error: {}",
                    owner + " " + location + " " + offset + " " + limit
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "get greenhouses success, data service response: {}",
                greenhouse
        );
        List<GreenHouseResponse> greenHouseResponses = greenHousesService.getGreenHouse(owner, offset, limit).getContent();

        return ApiResponse.<List<GreenHouseResponse>>builder()
                .data(greenHouseResponses)
                .status(HttpStatus.OK)
                .message("get greenhouse successful")
                .success(true)
                .build();
    }

    @Transactional
    @GetMapping(value = "/ds-get/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<GreenHouseResponse> getGreenhouse(@PathVariable String greenhouse_id) {
        GreenHouseDataServiceResponse greenhouse = greenHousesHTTPsDataService.getGreenhouse(greenhouse_id);
        if (greenhouse == null) {
            log.info(
                    "get greenhouse failed, data service not response or error: {}",
                    greenhouse_id
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "get greenhouses success, data service response: {}",
                greenhouse
        );
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.getGreenHouse(greenhouse.getOwner(), 0, 10).getContent().get(0))
                .status(HttpStatus.OK)
                .message("get greenhouse successful")
                .success(true)
                .build();
    }

    @Transactional
    @DeleteMapping(value = "/ds-delete/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<String> deleteGreenhouse(@PathVariable String greenhouse_id) {
        String response = safeExecute(
                () -> greenHousesHTTPsDataService.deleteGreenhouse(greenhouse_id),
                "Delete greenhouse failed"
        );
        return buildResponse(response, "Delete greenhouse successful");
    }

    @Transactional
    @PostMapping(value = "ds-create-field/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<Field> createField(
            @PathVariable String greenhouse_id,
            @RequestBody Field field
    ) {
        Field response = safeExecute(
                () -> greenHousesHTTPsDataService.createField(greenhouse_id, field),
                "Create field failed"
        );
        return buildResponse(response, "Create field successful");
    }


    @Transactional
    @GetMapping(value = "ds-get-list-field/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<List<Field>> getListField(@PathVariable String greenhouse_id) {
        List<Field> response = safeExecute(
                () -> greenHousesHTTPsDataService.getFields(greenhouse_id),
                "Get fields failed"
        );
        return buildResponse(response, "Get fields successful");
    }

    @GetMapping(value = "ds-get-field/{greenhouse_id}/field/{field_index}", consumes = "application/json",produces = "application/json")
    public ApiResponse<Field> getField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    ) {
        Field response = safeExecute(
                () -> greenHousesHTTPsDataService.getField(greenhouse_id, field_index),
                "Get field failed"
        );
        return buildResponse(response, "Get field successful");
    }

    @Transactional
    @DeleteMapping(value = "ds-delete-field/{greenhouse_id}/field/{field_index}", consumes = "application/json",produces = "application/json")
    public ApiResponse<String> deleteField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    ) {
        String response = safeExecute(
                () -> greenHousesHTTPsDataService.deleteField(greenhouse_id, field_index),
                "Delete field failed"
        );
        return buildResponse(response, "Delete field successful");
    }

    @GetMapping(value = "ds-get-field-history/{greenhouse_id}/field/{field_index}", produces = "application/json")
    public ApiResponse<Object> getFieldHistory(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index,
            @RequestParam String sensor_type,
            @RequestParam String start_time,
            @RequestParam String end_time
    ) {
        Object response = safeExecute(
                () -> greenHousesHTTPsDataService.getFieldHistory(greenhouse_id, field_index, sensor_type, start_time, end_time),
                "Get field history failed"
        );
        return buildResponse(response, "Get field history successful");
    }

    @Transactional
    @PostMapping(value = "ds-control-field/{greenhouse_id}/field/{field_index}", consumes = "application/json",produces = "application/json")
    public ApiResponse<String> controlField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index,
            @RequestBody Device device,
            @RequestBody Action action
    ) {
        if (device == null || action == null) {
            log.info(
                    "control field failed, device or action is null: {}",
                    device + " " + action
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        String fieldResponse = greenHousesHTTPsDataService.controlFieldDevice(
                greenhouse_id,
                field_index,
                device,
                action
        );
        if (fieldResponse == null) {
            log.info(
                    "control field failed, data service not response or error: {}",
                    field_index
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "control field success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<String>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("control field successful")
                .success(true)
                .build();
    }
    private <T> ApiResponse<T> buildResponse(T data, String message) {
        return ApiResponse.<T>builder()
                .data(data)
                .status(HttpStatus.OK)
                .message(message)
                .success(true)
                .build();
    }

    private <T> T safeExecute(Supplier<T> action, String errorMessage) {
        try {
            return action.get();
        } catch (Exception e) {
            log.error("{}: {}", errorMessage, e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
    private GreenHouseCreateRequest mapToCreateRequest(GreenHouseDataServiceResponse response) {
        GreenHouseCreateRequest request = new GreenHouseCreateRequest();
        request.setGreenhouseId(response.getGreenhouse_id());
        request.setName(response.getName());
        request.setLocation(response.getLocation());
        request.setStatus(true);
        request.setDescription(response.getOwner());
        request.setUserId(response.getOwner());
        return request;
    }

}

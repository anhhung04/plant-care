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

    public GreenHousesControllerHTTPs(GreenHousesService greenHousesService, GreenHousesHTTPsDataService greenHousesHTTPsDataService) {
        this.greenHousesService = greenHousesService;
        this.greenHousesHTTPsDataService = greenHousesHTTPsDataService;
    }

    @GetMapping()
    public ApiResponse<Page<GreenHouseResponse>> getGreenHouses(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<Page<GreenHouseResponse>>builder()
                .data(greenHousesService.getGreenHouse(name, page, size))
                .status(HttpStatus.OK)
                .message("get greenhouse successful")
                .success(true)
                .build();
    }

    @PatchMapping("/update/{greenhouses_id}")
    public ApiResponse<GreenHouseResponse> updateGreenHouses(@PathVariable String greenhouses_id) {
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.updateGreenHouses(greenhouses_id))
                .status(HttpStatus.OK)
                .message("update greenhouse successful")
                .success(true)
                .build();
    }

    @PostMapping("/create")
    public ApiResponse<GreenHouseResponse> create(@RequestBody GreenHouseCreateRequest greenHouseCreateRequest) {
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.createGreenHouse(greenHouseCreateRequest))
                .status(HttpStatus.OK)
                .message("create greenhouse successful")
                .success(true)
                .build();
    }


    @Transactional
    @PostMapping(value = "/ds-create", consumes = "application/json", produces = "application/json")
    public ApiResponse<GreenHouseResponse> createGreenhouse(@RequestBody GreenHouseDataServiceCreateRequest request) {
        GreenHouseDataServiceResponse greenhouse;
        try {
             greenhouse = greenHousesHTTPsDataService.createGreenhouse(request);
        }
        catch (Exception e) {
            log.error("create greenhouse failed, data service not response or error: {}", e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        if (greenhouse == null) {
            log.info(
                    "create greenhouse failed, data service not response or error: {}",
                    request
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "create greenhouse success, data service response: {}",
                greenhouse
        );
        GreenHouseCreateRequest greenHouseCreateRequest = new GreenHouseCreateRequest();
        greenHouseCreateRequest.setGreenhouseId(greenhouse.getGreenhouse_id());
        greenHouseCreateRequest.setName(greenhouse.getName());
        greenHouseCreateRequest.setLocation(greenhouse.getLocation());
        greenHouseCreateRequest.setStatus(true);
        greenHouseCreateRequest.setDescription(greenhouse.getOwner());
        greenHouseCreateRequest.setUserId(greenhouse.getOwner());
        log.info(
                "create greenhouse success, data service response: {}",
                greenHouseCreateRequest
        );
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.createGreenHouse(greenHouseCreateRequest))
                .status(HttpStatus.OK)
                .message("create greenhouse successful")
                .success(true)
                .build();
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
        String greenhouse = greenHousesHTTPsDataService.deleteGreenhouse(greenhouse_id);
        if (greenhouse == null) {
            log.info(
                    "delete greenhouse failed, data service not response or error: {}",
                    greenhouse_id
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "delete greenhouses success, data service response: {}",
                greenhouse
        );
        return ApiResponse.<String>builder()
                .data(greenhouse)
                .status(HttpStatus.OK)
                .message("delete greenhouse successful")
                .success(true)
                .build();
    }

    @Transactional
    @PostMapping(value = "ds-create-field/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<Field> createField(
            @PathVariable String greenhouse_id,
            @RequestBody Field field
    ) {
        Field fieldResponse = greenHousesHTTPsDataService.createField(greenhouse_id, field);
        if (fieldResponse == null) {
            log.info(
                    "create field failed, data service not response or error: {}",
                    field
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "create field success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<Field>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("create field successful")
                .success(true)
                .build();
    }


    @Transactional
    @GetMapping(value = "ds-get-list-field/{greenhouse_id}", consumes = "application/json",produces = "application/json")
    public ApiResponse<List<Field>> getListField(@PathVariable String greenhouse_id) {
        List<Field> fieldResponse = greenHousesHTTPsDataService.getFields(greenhouse_id);
        if (fieldResponse == null) {
            log.info(
                    "get list field failed, data service not response or error: {}",
                    greenhouse_id
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "get list field success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<List<Field>>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("get list field successful")
                .success(true)
                .build();
    }

    @GetMapping(value = "ds-get-field/{greenhouse_id}/field/{field_index}", consumes = "application/json",produces = "application/json")
    public ApiResponse<Field> getField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    ) {
        Field fieldResponse = greenHousesHTTPsDataService.getField(
                greenhouse_id,
                field_index
        );
        if (fieldResponse == null) {
            log.info(
                    "get field failed, data service not response or error: {}",
                    field_index
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "get field success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<Field>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("get field successful")
                .success(true)
                .build();
    }

    @Transactional
    @DeleteMapping(value = "ds-delete-field/{greenhouse_id}/field/{field_index}", consumes = "application/json",produces = "application/json")
    public ApiResponse<String> deleteField(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index
    ) {
        String fieldResponse = greenHousesHTTPsDataService.deleteField(
                greenhouse_id,
                field_index
        );
        if (fieldResponse == null) {
            log.info(
                    "delete field failed, data service not response or error: {}",
                    field_index
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "delete field success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<String>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("delete field successful")
                .success(true)
                .build();
    }

    @GetMapping(value = "ds-get-field-history/{greenhouse_id}/field/{field_index}", produces = "application/json")
    public ApiResponse<Object> getFieldHistory(
            @PathVariable String greenhouse_id,
            @PathVariable Integer field_index,
            @RequestParam String sensor_type,
            @RequestParam String start_time,
            @RequestParam String end_time
    ) {
        Object fieldResponse;
        try {
            fieldResponse = greenHousesHTTPsDataService.getFieldHistory(
                    greenhouse_id,
                    field_index,
                    sensor_type,
                    start_time,
                    end_time
            );
        }
        catch (Exception e) {
            log.error("get field history failed, data service not response or error: {}", e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        if (fieldResponse == null) {
            log.info(
                    "get field history failed, data service not response or error: {}",
                    field_index
            );
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        log.info(
                "get field history success, data service response: {}",
                fieldResponse
        );
        return ApiResponse.<Object>builder()
                .data(fieldResponse)
                .status(HttpStatus.OK)
                .message("get field history successful")
                .success(true)
                .build();
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


}

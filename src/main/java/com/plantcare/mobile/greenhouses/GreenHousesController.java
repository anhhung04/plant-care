package com.plantcare.mobile.greenhouses;

import java.util.List;
import java.util.UUID;

import com.plantcare.mobile.exception.AppException;
import com.plantcare.mobile.exception.ErrorCode;
import com.plantcare.mobile.greenhouses.dto.request.SubscribeRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/greenhouses")
@RequiredArgsConstructor
@Slf4j
public class GreenHousesController {
    private final GreenHousesService greenHousesService;

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
    public ApiResponse<GreenHouseResponse> updateGreenHouses(@PathVariable UUID greenhouses_id) {
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.updateGreenHouses(greenhouses_id))
                .status(HttpStatus.OK)
                .message("update greenhouse successful")
                .success(true)
                .build();
    }


    @MessageMapping("/subscribe")
    public void subToGreenHouses(@RequestHeader("Authorization") String token,@RequestBody SubscribeRequest greenhouseIds) {
        // realtime processing
        try {
            greenHousesService.subToGreenHouses(token,greenhouseIds);
        }
        catch(Exception e) {
            log.error(e.getMessage());
            throw new AppException(ErrorCode.SOCKET_NOT_CONNECTED);
        }
    }

    //    @PostMapping("/unsubscribe")
    //    public ApiResponse<String> unSub(@RequestBody List<SubGreenHouse> subGreenHouses) {
    //    }

    @PostMapping("/create")
    public ApiResponse<GreenHouseResponse> create(@RequestBody GreenHouseCreateRequest greenHouseCreateRequest) {
        return ApiResponse.<GreenHouseResponse>builder()
                .data(greenHousesService.createGreenHouse(greenHouseCreateRequest))
                .status(HttpStatus.OK)
                .message("create greenhouse successful")
                .success(true)
                .build();
    }
}

package com.plantcare.mobile.greenhouses;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.request.SubGreenHouse;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import com.plantcare.mobile.greenhouses.entity.GreenHouses;
import com.plantcare.mobile.notification.NotificationService;
import com.plantcare.mobile.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Pageable;
import java.util.List;
import java.util.UUID;

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
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<GreenHouseResponse>>builder()
                .data(greenHousesService.getGreenHouse(name,page,size))
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

    @MessageMapping("/sub")
    public void subToGreenHouses(@RequestBody List<SubGreenHouse> greenhouseIds) {
        // realtime processing
        greenHousesService.subToGreenHouses(greenhouseIds);
    }


//    @PostMapping("/unsub")
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
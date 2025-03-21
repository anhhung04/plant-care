package com.plantcare.mobile.greenhouses;

import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.exception.AppException;
import com.plantcare.mobile.exception.ErrorCode;
import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.request.SubscribeRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GreenHousesControllerSocket {
    private final GreenHousesService greenHousesService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/subscribe")
    @SendTo("/queue/greenhouse/c670e06e-afa8-4d4f-8005-b7bea9b38054")
    public String subToGreenHouses(@RequestHeader("Authorization") String token,@RequestBody SubscribeRequest greenhouseIds) {
        // realtime processing
        try {
            greenHousesService.subToGreenHouses(token,greenhouseIds);
        }
        catch(Exception e) {
            log.error(e.getMessage());
            throw new AppException(ErrorCode.SOCKET_NOT_CONNECTED);
        }
        messagingTemplate.convertAndSend("/queue/greenhouse/c670e06e-afa8-4d4f-8005-b7bea9b38054","Sub successfully");
        return "Sub successfully";
    }

    @MessageMapping("/unsubscribe")
    public String unsubToGreenHouses(@RequestHeader("Authorization") String token,@RequestBody SubscribeRequest greenhouseIds) {
        // realtime processing
        try {
            greenHousesService.unsubToGreenHouse(token,greenhouseIds);
        }
        catch(Exception e) {
            log.error(e.getMessage());
            throw new AppException(ErrorCode.SOCKET_NOT_CONNECTED);
        }
        return "Unsub successfully";
    }
}

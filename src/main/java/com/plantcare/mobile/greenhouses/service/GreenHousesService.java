package com.plantcare.mobile.greenhouses.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.plantcare.mobile.clientsocket.ClientSocketSessionRegistry;
import com.plantcare.mobile.dtoGlobal.Field;
import com.plantcare.mobile.exception.AppException;
import com.plantcare.mobile.exception.ErrorCode;
import com.plantcare.mobile.greenhouses.dto.request.SubscribeRequest;
import com.plantcare.mobile.greenhouses.feignclient.GreenHousesHTTPsDataService;
import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import com.plantcare.mobile.greenhouses.entity.GreenHouses;
import com.plantcare.mobile.greenhouses.mapper.GreenHouseMapper;
import com.plantcare.mobile.greenhouses.repository.GreenHousesRepository;
import com.plantcare.mobile.sensor.SensorRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GreenHousesService {
    private GreenHousesRepository greenHousesRepository;
    private GreenHouseMapper greenHouseMapper;
    private SensorRepository sensorRepository;
    private SimpMessagingTemplate messagingTemplate;
    private final ClientSocketSessionRegistry clientSocketSessionRegistry;
    private GreenHousesHTTPsDataService greenHousesHTTPsDataService;

    // Update data tu dataservice
    public void updateGreenhouse(Object dataUpdate) {
        // Xu ly update data len mongodb o day
        messagingTemplate.convertAndSend("/topic/greenhouse/" + dataUpdate);
    }

    public GreenHouseResponse createGreenHouse(GreenHouseCreateRequest greenHouseCreateRequest) {
        GreenHouses greenHouses = greenHouseMapper.toGreenHouses(greenHouseCreateRequest);
        // O day minh se truyen userid tao tu jwt, nma bay gio chua co

        greenHouses.setCreatedAt(LocalDateTime.now());
        return greenHouseMapper.toGreenHouseResponse(greenHousesRepository.save(greenHouses));
    }

    public Page<GreenHouseResponse> getGreenHouse(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (!Objects.equals(name, "")){
            return greenHousesRepository.findAllByName(name, pageable).map(greenHouseMapper::toGreenHouseResponse);
        }
        return greenHousesRepository.findAll(pageable).map(greenHouseMapper::toGreenHouseResponse);
    }

    public GreenHouseResponse updateGreenHouses(String greenhouseId) {
        GreenHouses greenHouse = greenHousesRepository
                .findById(greenhouseId)
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        // fake data, we will implement later
        greenHouse.setCreatedAt(LocalDateTime.now());
        GreenHouseResponse response = greenHouseMapper.toGreenHouseResponse(greenHousesRepository.save(greenHouse));

        // 🔹 Lấy danh sách user đang subscribe greenhouseId này
        List<String> subscribers = clientSocketSessionRegistry.getSubscribers(greenhouseId);
        log.info("subscribers: {}", subscribers);
        // 🔹 Gửi dữ liệu WebSocket đến từng user đang subscribe
        for (String userId : subscribers) {
            log.info("userID sub " + userId);
            try{
                messagingTemplate.convertAndSend("/queue/greenhouse/"+userId.toString(), response);
                log.info("a");
            }
            catch (Exception e){
                log.info(e.getMessage());
            }
            log.info(response.toString());
            log.info("urlsend: /" + userId + "/queue/greenhouse");

        }
        return response;
    }

    public void subToGreenHouses(String token, SubscribeRequest subGreenHouses) {
        token = token.substring(7);

        log.info("token "+token);

        String userId= "c670e06e-afa8-4d4f-8005-b7bea9b38054";

        clientSocketSessionRegistry.unsubscribeAll(userId);

        for (String sub : subGreenHouses.getGreenhouseIds()) {
            clientSocketSessionRegistry.subscribe(userId,sub);
            log.info("Userid {} subscribed to greenhouse {}", userId, sub);
        }
    }
    
    public void unsubToGreenHouse(String token, SubscribeRequest unsubGreenHouses) {
        token = token.substring(7);
        log.info("token "+token);

        String userId= "c670e06e-afa8-4d4f-8005-b7bea9b38054";

        for(String sub : unsubGreenHouses.getGreenhouseIds()) {
            clientSocketSessionRegistry.unsubscribe(userId,sub);
        }
    }

    public void checkGreenHouse(String greenhouseId) {
        greenHousesRepository
                .findById(greenhouseId)
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));
        // fake data, we will implement later
    }

    public void checkFieldIndex(String greenhouseId, Integer fieldIndex) {
        try {
            Field field=greenHousesHTTPsDataService.getField(greenhouseId, fieldIndex);
            if (field == null) {
                throw new AppException(ErrorCode.FIELD_NOT_FOUND);
            }
        }
        catch (Exception e) {
            throw new AppException(ErrorCode.FIELD_NOT_FOUND);
        }

    }
}

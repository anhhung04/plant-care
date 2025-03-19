package com.plantcare.mobile.greenhouses;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.request.SubGreenHouse;
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

    // Update data tu dataservice
    public void updateGreenhouse(Object dataUpdate) {
        // Xu ly update data len mongodb o day
        messagingTemplate.convertAndSend("/topic/greenhouse/" + dataUpdate);
    }

    public GreenHouseResponse createGreenHouse(GreenHouseCreateRequest greenHouseCreateRequest) {
        GreenHouses greenHouses = greenHouseMapper.toGreenHouses(greenHouseCreateRequest);
        // O day minh se truyen userid tao tu jwt, nma bay gio chua co
        greenHouses.setUserId("Tamthoichuaco");
        greenHouses.setCreatedAt(LocalDateTime.now());
        return greenHouseMapper.toGreenHouseResponse(greenHousesRepository.save(greenHouses));
    }

    public Page<GreenHouseResponse> getGreenHouse(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return greenHousesRepository.findAllByName(name, pageable).map(greenHouseMapper::toGreenHouseResponse);
    }

    public GreenHouseResponse updateGreenHouses(UUID greenhouseId) {
        GreenHouses greenHouse = greenHousesRepository
                .findById(greenhouseId)
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        // fake data, we will implement later
        greenHouse.setCreatedAt(LocalDateTime.now());
        GreenHouseResponse response = greenHouseMapper.toGreenHouseResponse(greenHousesRepository.save(greenHouse));

        messagingTemplate.convertAndSend("/topic/greenhouse/" + greenhouseId, response);
        return response;
    }

    public void subToGreenHouses(List<SubGreenHouse> subGreenHouses) {
        for (SubGreenHouse sub : subGreenHouses) {
            messagingTemplate.convertAndSend("/topic/greenhouse/" + sub.getId(), "Subscribed successfully!");
        }
    }
}

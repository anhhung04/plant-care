package com.plantcare.mobile.notification;

import com.plantcare.mobile.notification.dto.request.FCMregister;
import com.plantcare.mobile.notification.entity.FCMToken;
import com.plantcare.mobile.notification.repository.FcmTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class FcmService {

    @Autowired
    private FcmTokenRepository fcmTokenRepository;

    public String saveToken(FCMregister fcMregister) {
        FCMToken existingToken = fcmTokenRepository.findByToken(fcMregister.getToken());
        if (existingToken != null) {
            log.warn("Token already exists: {}", fcMregister.getToken());
            return "Token already exists";
        }

        FCMToken fcmToken = fcmTokenRepository.findByUserId(fcMregister.getUserId());
        if (fcmToken == null) {
            fcmToken = new FCMToken();
        }
        fcmToken.setToken(fcMregister.getToken());
        fcmToken.setUserId(fcMregister.getUserId());
        try {
            FCMToken response = fcmTokenRepository.save(fcmToken);
            log.info("Token saved successfully: {}", response);
            return "Successfully";
        } catch (Exception e) {
            log.error("Error saving token: {}", e.getMessage());
            return e.getMessage();
        }
    }
    public List<FCMToken> getAllTokens(){
        return fcmTokenRepository.findAll();
    }
}

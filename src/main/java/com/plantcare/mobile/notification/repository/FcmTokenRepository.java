package com.plantcare.mobile.notification.repository;

import com.plantcare.mobile.notification.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FcmTokenRepository extends JpaRepository<FCMToken, String> {
    FCMToken findByUserId(String userId);
    FCMToken findByToken(String token); // Add this method
}

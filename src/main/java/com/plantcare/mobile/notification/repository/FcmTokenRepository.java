package com.plantcare.mobile.notification.repository;

import com.plantcare.mobile.notification.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FcmTokenRepository extends JpaRepository<FCMToken, String> {
    FCMToken findByUserId(String userId);
    FCMToken findByToken(String token); // Add this method
    Optional <FCMToken> findAllByToken(String token);
    void deleteByToken(String token);
}

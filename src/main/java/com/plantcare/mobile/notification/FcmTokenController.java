package com.plantcare.mobile.notification;

import com.plantcare.mobile.notification.entity.FCMToken;
import com.plantcare.mobile.notification.repository.FcmTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fcm-token")
public class FcmTokenController {
    @Autowired
    private FcmTokenRepository repo;

    @PostMapping("/save")
    public ResponseEntity<String> save(@RequestBody FCMToken body) {
        if (body.getToken() == null || body.getToken().isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
        repo.save(body);
        return ResponseEntity.ok("Saved");
    }
}
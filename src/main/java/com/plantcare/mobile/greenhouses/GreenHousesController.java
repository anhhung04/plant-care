package com.plantcare.mobile.greenhouses;

import com.plantcare.mobile.notification.NotificationService;
import com.plantcare.mobile.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/greenhouses")
@RequiredArgsConstructor
@Slf4j
public class GreenHousesController {
    private final NotificationService notificationService;

    @GetMapping()
    public ResponseEntity<List<Notification>> getAllGreenHouses() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.saveNotification(notification));
    }

    @GetMapping("/check-connection")
    public ResponseEntity<Boolean> checkDatabaseConnection() {
        return ResponseEntity.ok(notificationService.checkConnection());
    }
}
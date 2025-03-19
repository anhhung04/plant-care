package com.plantcare.mobile.notification;

import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.plantcare.mobile.notification.entity.Notification;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Lấy danh sách tất cả thông báo
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Lấy thông báo theo User
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Lưu thông báo vào database
    @Transactional
    public Notification saveNotification(Notification notification) {
        log.info("Saving notification: {}", notification);
        return notificationRepository.save(notification);
    }

    // Kiểm tra kết nối đến database
    public boolean checkConnection() {
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            log.info("✅ Connected to PostgreSQL!");
            return true;
        } catch (Exception e) {
            log.error("❌ Database connection failed: {}", e.getMessage());
            return false;
        }
    }
}

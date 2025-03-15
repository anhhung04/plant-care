package com.plantcare.mobile.notification;

import com.plantcare.mobile.notification.entity.Notification;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserId(String userId);
}

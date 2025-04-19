package com.plantcare.mobile.scheduledTask.repository;

import com.plantcare.mobile.scheduledTask.entity.ScheduledTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduledTaskRepository extends JpaRepository<com.plantcare.mobile.scheduledTask.entity.ScheduledTask, Long> {
    List<ScheduledTask> findByExecutedFalseAndScheduledTimeBefore(LocalDateTime now);
}
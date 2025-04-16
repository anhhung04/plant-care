package com.plantcare.mobile.scheduledTask.entity;

import com.plantcare.mobile.dtoGlobal.Action;
import com.plantcare.mobile.dtoGlobal.Device;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class ScheduledTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String greenhouseId;
    private Integer fieldIndex;
    private String device;
    private Integer value;
    private LocalDateTime scheduledTime;
    private boolean executed = false;
}
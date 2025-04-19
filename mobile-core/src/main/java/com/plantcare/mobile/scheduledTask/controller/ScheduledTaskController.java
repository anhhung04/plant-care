package com.plantcare.mobile.scheduledTask.controller;

import com.plantcare.mobile.dtoGlobal.Action;
import com.plantcare.mobile.dtoGlobal.Device;
import com.plantcare.mobile.dtoGlobal.response.ApiResponse;
import com.plantcare.mobile.scheduledTask.entity.ScheduledTask;
import com.plantcare.mobile.scheduledTask.service.ScheduledTaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/scheduled-tasks")

public class ScheduledTaskController {

    private final ScheduledTaskService scheduledTaskService;

    public ScheduledTaskController(ScheduledTaskService scheduledTaskService) {
        this.scheduledTaskService = scheduledTaskService;
    }

    @PostMapping("/control")
    public ApiResponse<ScheduledTask> scheduleControlField(
            @RequestParam String greenhouseId,
            @RequestParam Integer fieldIndex,
            @RequestParam String device,
            @RequestParam Integer value,
            @RequestParam String scheduledTime // ISO-8601 format: yyyy-MM-ddTHH:mm:ss
    ) {
        LocalDateTime time = LocalDateTime.parse(scheduledTime);
        ScheduledTask task = scheduledTaskService.scheduleTask(greenhouseId, fieldIndex, device, value, time);
        return ApiResponse.<ScheduledTask>builder()
                .status(HttpStatus.OK)
                .message("Scheduled task created successfully")
                .data(task)
                .build();
    }
}

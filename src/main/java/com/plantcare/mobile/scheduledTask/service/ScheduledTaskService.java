package com.plantcare.mobile.scheduledTask.service;

import com.plantcare.mobile.dtoGlobal.Action;
import com.plantcare.mobile.dtoGlobal.Device;
import com.plantcare.mobile.greenhouses.controller.GreenHousesControllerHTTPs;
import com.plantcare.mobile.greenhouses.feignclient.GreenHousesHTTPsDataService;
import com.plantcare.mobile.greenhouses.service.GreenHousesService;
import com.plantcare.mobile.scheduledTask.entity.ScheduledTask;
import com.plantcare.mobile.scheduledTask.repository.ScheduledTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduledTaskService {

    private final ScheduledTaskRepository scheduledTaskRepository;
    private final GreenHousesHTTPsDataService greenHousesHTTPsDataService;
    private final GreenHousesService greenHousesService;

    public ScheduledTask scheduleTask(String greenhouseId, Integer fieldIndex, Device device, Action action, LocalDateTime scheduledTime) {
        // Kiểm tra xem greenhouseId có hợp lệ không
        greenHousesService.checkGreenHouse(greenhouseId);
        // Kiểm tra xem fieldIndex có hợp lệ không
        greenHousesService.checkFieldIndex(greenhouseId, fieldIndex);
        ScheduledTask task = new ScheduledTask();
        task.setGreenhouseId(greenhouseId);
        task.setFieldIndex(fieldIndex);
        task.setDevice(device);
        task.setAction(action);
        task.setScheduledTime(scheduledTime);
        return scheduledTaskRepository.save(task);
    }

    @Scheduled(fixedRate = 60000) // Chạy mỗi phút
    public void executeScheduledTasks() {
        List<ScheduledTask> tasks = scheduledTaskRepository.findByExecutedFalseAndScheduledTimeBefore(LocalDateTime.now());
        for (ScheduledTask task : tasks) {
            try {
                // Check xem có quá 20 phút sau thời gian thực hiện không
                if (task.getScheduledTime().plusMinutes(20).isBefore(LocalDateTime.now())) {
                    log.warn("Task {} is too old and will not be executed", task);
                    continue;
                }
                // Gọi dịch vụ HTTP để điều khiển thiết bị
                greenHousesHTTPsDataService.controlFieldDevice(
                        task.getGreenhouseId(),
                        task.getFieldIndex(),
                        task.getDevice(),
                        task.getAction()
                );
                task.setExecuted(true);
                scheduledTaskRepository.save(task);
                log.info("Executed task: {}", task);
            } catch (Exception e) {
                log.error("Failed to execute task: {}", task, e);
            }
        }
    }
}
package com.plantcare.mobile.notification;

import com.google.common.collect.Lists;
import com.plantcare.mobile.notification.entity.FCMToken;
import com.plantcare.mobile.notification.repository.FcmTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class ExpoPushService {

    private String expoPushUrl = "https://exp.host/--/api/v2/push/send";

    private final FcmTokenRepository repo;
    private final RestTemplate restTemplate;

    public ExpoPushService(FcmTokenRepository repo, RestTemplate restTemplate) {
        this.repo = repo;
        this.restTemplate = restTemplate;
    }

    public void sendNotifications(String title, String body) {
        List<String> tokens = repo.findAll().stream()
                .map(FCMToken::getToken)
                .collect(Collectors.toList());

        Lists.partition(tokens, 100).forEach(chunk -> {
            List<Map<String, Object>> messages = chunk.stream()
                    .map(t -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("to", t);
                        map.put("title", title);
                        map.put("body", body);
                        return map;
                    })
                    .collect(Collectors.toList());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<Map<String,Object>>> request =
                    new HttpEntity<>(messages, headers);

            String resp = restTemplate.postForObject(expoPushUrl, request, String.class);
            // xử lý resp nếu cần xóa token không hợp lệ
        });
    }
}
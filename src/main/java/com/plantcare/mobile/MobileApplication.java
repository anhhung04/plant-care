package com.plantcare.mobile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;

@SpringBootApplication

public class MobileApplication {
    public static void main(String[] args) {
        SpringApplication.run(MobileApplication.class, args);
        System.out.println("Server is starting...");
    }

    @SpringBootApplication
    static class ServerPortListener implements ApplicationListener<WebServerInitializedEvent> {
        @Override
        public void onApplicationEvent(WebServerInitializedEvent event) {
            int port = event.getWebServer().getPort();
            System.out.println("Server is running on: http://localhost:" + port);
        }
    }
}

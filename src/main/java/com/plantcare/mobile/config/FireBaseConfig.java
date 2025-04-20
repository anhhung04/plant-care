package com.plantcare.mobile.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.client.RestTemplate;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FireBaseConfig {

    @Bean
    public FirebaseMessaging firebaseMessaging() throws IOException {
        GoogleCredentials googleCredentials = GoogleCredentials
                .fromStream(new ClassPathResource("notificationplancare-firebase-adminsdk-fbsvc-a95a5319eb.json").getInputStream());
        FirebaseOptions firebaseOptions = FirebaseOptions.builder()
                .setCredentials(googleCredentials)
                .build();

        FirebaseApp firebaseApp;
        if (FirebaseApp.getApps().stream().noneMatch(app -> app.getName().equals("plantcare"))) {
            firebaseApp = FirebaseApp.initializeApp(firebaseOptions, "plantcare");
        } else {
            firebaseApp = FirebaseApp.getInstance("plantcare");
        }

        return FirebaseMessaging.getInstance(firebaseApp);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    @Bean
    public Firestore firestore() throws IOException {
        GoogleCredentials googleCredentials = GoogleCredentials
                .fromStream(new ClassPathResource("notificationplancare-firebase-adminsdk-fbsvc-a95a5319eb.json").getInputStream());
        FirebaseOptions firebaseOptions = FirebaseOptions.builder()
                .setCredentials(googleCredentials)
                .build();

        FirebaseApp firebaseApp;
        if (FirebaseApp.getApps().stream().noneMatch(app -> app.getName().equals("plantcare2"))) {
            firebaseApp = FirebaseApp.initializeApp(firebaseOptions, "plantcare2");
        } else {
            firebaseApp = FirebaseApp.getInstance("plantcare2");
        }
        return FirestoreClient.getFirestore(firebaseApp);
    }
}
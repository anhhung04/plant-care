package com.plantcare.mobile.notification.entity;


import jakarta.persistence.*;
import lombok.*;
import org.checkerframework.checker.units.qual.C;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FCMToken{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    private String userId;

    @Column(unique = true)
    private String token;
}

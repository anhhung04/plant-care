package com.plantcare.mobile.notification.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.checkerframework.checker.units.qual.C;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FCMToken{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    private String userId;

    @Column(unique = true)
    private String token;
}

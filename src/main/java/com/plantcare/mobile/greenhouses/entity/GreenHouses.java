package com.plantcare.mobile.greenhouses.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "greenhouses")
public class GreenHouses {

    @Id
    @Column(name = "greenhouse_id")
    private String greenhouseId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String name;
    private String location;
    private String status;
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

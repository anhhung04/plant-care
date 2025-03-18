package com.plantcare.mobile.greenhouses.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "greenhouses")
public class GreenHouses {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID greenhouse_id;
    private String user_id;
    private String name;
    private String location;
    private Boolean status;
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

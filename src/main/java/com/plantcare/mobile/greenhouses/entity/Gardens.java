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
@Table(name = "gardens")
public class Gardens {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID garden_id;
    private String name;
    private String land_area;
}

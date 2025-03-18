package com.plantcare.mobile.gardens.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Column(name = "garden_id")
    private UUID gardenId;
    private String name;
    @Column(name = "land_area")
    private String landArea;
}

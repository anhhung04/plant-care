package com.plantcare.mobile.greenhouses.entity;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Embeddable;

import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GreenhouseGardenId implements Serializable {
    private UUID greenhouseId;
    private UUID gardenId;
}

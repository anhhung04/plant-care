package com.plantcare.mobile.greenhouses.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

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
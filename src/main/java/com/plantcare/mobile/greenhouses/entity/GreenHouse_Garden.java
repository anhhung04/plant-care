package com.plantcare.mobile.greenhouses.entity;

import com.plantcare.mobile.gardens.entity.Gardens;
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
@Table(name = "greenhouse_garden")
public class GreenHouse_Garden {

    @EmbeddedId
    private GreenhouseGardenId id;

    @ManyToOne
    @MapsId("greenhouseId")
    @JoinColumn(name = "greenhouse_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gg_greenhouse", foreignKeyDefinition = "FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE"))
    private GreenHouses greenhouses;

    @ManyToOne
    @MapsId("gardenId")
    @JoinColumn(name = "garden_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gg_garden", foreignKeyDefinition = "FOREIGN KEY (garden_id) REFERENCES gardens(garden_id) ON DELETE CASCADE"))
    private Gardens gardens;
}

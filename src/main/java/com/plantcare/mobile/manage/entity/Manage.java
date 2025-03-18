package com.plantcare.mobile.manage.entity;

import com.plantcare.mobile.greenhouses.entity.GreenHouses;
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
@Table(name = "manage")
public class Manage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "greenhouse_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gg_greenhouse", foreignKeyDefinition = "FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE"))
    private GreenHouses greenhouses;

    private UUID userId;
}

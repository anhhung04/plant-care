package com.plantcare.mobile.sensorsupabase.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;

import com.plantcare.mobile.greenhouses.entity.GreenHouses;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sensors")
public class SensorSupabase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "sensor_id", updatable = false, nullable = false)
    private UUID sensorId;

    @ManyToOne
    @JoinColumn(
            name = "greenhouse_id",
            nullable = false,
            foreignKey =
                    @ForeignKey(
                            name = "fk_sensor_greenhouse",
                            foreignKeyDefinition =
                                    "FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(greenhouse_id) ON DELETE CASCADE"))
    private GreenHouses greenhouse;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "max_threshold")
    private Double maxThreshold;

    @Column(name = "min_threshold")
    private Double minThreshold;

    @Column(name = "last_modify", nullable = false, columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private Instant lastModify = Instant.now();
}

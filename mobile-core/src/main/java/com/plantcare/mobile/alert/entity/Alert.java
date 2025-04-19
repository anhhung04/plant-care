package com.plantcare.mobile.alert.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;

import com.plantcare.mobile.sensorsupabase.entity.SensorSupabase;

import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "alert_id", updatable = false, nullable = false)
    private String alertId;

    @ManyToOne
    @JoinColumn(
            name = "sensor_id",
            nullable = false,
            foreignKey =
                    @ForeignKey(
                            name = "fk_alert_sensor",
                            foreignKeyDefinition =
                                    "FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE"))
    private SensorSupabase sensor;

    @Column(name = "message")
    private String message;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "alert_time", nullable = false, columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private Instant alertTime = Instant.now();
}

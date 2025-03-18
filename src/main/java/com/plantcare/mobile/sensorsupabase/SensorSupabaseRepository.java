package com.plantcare.mobile.sensorsupabase;

import com.plantcare.mobile.sensorsupabase.entity.SensorSupabase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SensorSupabaseRepository extends JpaRepository<SensorSupabase, UUID> {
}

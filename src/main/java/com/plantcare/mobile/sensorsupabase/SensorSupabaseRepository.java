package com.plantcare.mobile.sensorsupabase;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.plantcare.mobile.sensorsupabase.entity.SensorSupabase;

@Repository
public interface SensorSupabaseRepository extends JpaRepository<SensorSupabase, UUID> {}

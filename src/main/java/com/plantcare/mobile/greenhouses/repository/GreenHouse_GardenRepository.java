package com.plantcare.mobile.greenhouses.repository;

import java.util.UUID;

import com.plantcare.mobile.greenhouses.entity.GreenHouse_Garden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GreenHouse_GardenRepository
        extends JpaRepository<GreenHouse_Garden, UUID> {}

package com.plantcare.mobile.greenhouses.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import com.plantcare.mobile.greenhouses.entity.GreenHouses;

@Repository
public interface GreenHousesRepository extends JpaRepository<GreenHouses, UUID> {
    Page<GreenHouses> findAllByName(String name, Pageable pageable);

    GreenHouseResponse findByGreenhouseId(UUID greenhousesId);
}

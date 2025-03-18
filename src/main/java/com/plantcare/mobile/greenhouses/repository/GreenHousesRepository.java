package com.plantcare.mobile.greenhouses.repository;

import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import com.plantcare.mobile.greenhouses.entity.GreenHouses;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GreenHousesRepository extends JpaRepository<GreenHouses, UUID> {
    Page<GreenHouses> findAllByName(String name, Pageable pageable);

    GreenHouseResponse findByGreenhouseId(UUID greenhousesId);
}

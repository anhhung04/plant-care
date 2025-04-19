package com.plantcare.mobile.gardens;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.plantcare.mobile.gardens.entity.Gardens;

@Repository
public interface GardensRepository extends JpaRepository<Gardens, String> {}

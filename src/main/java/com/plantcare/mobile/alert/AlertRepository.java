package com.plantcare.mobile.alert;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.plantcare.mobile.alert.entity.Alert;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {}

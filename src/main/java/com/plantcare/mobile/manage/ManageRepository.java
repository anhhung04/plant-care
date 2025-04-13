package com.plantcare.mobile.manage;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.plantcare.mobile.gardens.entity.Gardens;

@Repository
public interface ManageRepository extends JpaRepository<Gardens, String> {}

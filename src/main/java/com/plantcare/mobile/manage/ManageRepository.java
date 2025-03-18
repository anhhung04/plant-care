package com.plantcare.mobile.manage;

import com.plantcare.mobile.gardens.entity.Gardens;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ManageRepository extends JpaRepository<Gardens, UUID> {
}

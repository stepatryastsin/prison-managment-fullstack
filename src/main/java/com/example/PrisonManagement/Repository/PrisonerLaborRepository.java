package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.PrisonerLabor;
import com.example.PrisonManagement.Model.PrisonerLaborKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrisonerLaborRepository
        extends JpaRepository<PrisonerLabor, PrisonerLaborKey> {
    long countByPrisoner_PrisonerId(Integer prisonerId);
    boolean existsByPrisoner_PrisonerId(Integer prisonerId);
}
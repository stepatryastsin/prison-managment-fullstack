package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.PrisonerLabor;
import com.example.PrisonManagement.Entity.PrisonerLaborKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrisonerLaborRepository
        extends JpaRepository<PrisonerLabor, PrisonerLaborKey> {

}
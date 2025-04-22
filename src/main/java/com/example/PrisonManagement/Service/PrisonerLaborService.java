package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.PrisonerLabor;
import com.example.PrisonManagement.Entity.PrisonerLaborKey;

import java.util.List;
import java.util.Optional;

public interface PrisonerLaborService {
    List<PrisonerLabor> findAll();
    PrisonerLabor findById(Integer prisonerId, Integer staffId);
    PrisonerLabor save(PrisonerLabor prisonerLabor);
    void deleteById(Integer prisonerId, Integer staffId);
}
package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.PrisonerLabor;
import java.util.List;

public interface PrisonerLaborService {
    List<PrisonerLabor> findAll();
    PrisonerLabor findById(Integer prisonerId, Integer staffId);
    PrisonerLabor save(PrisonerLabor prisonerLabor);
    void deleteById(Integer prisonerId, Integer staffId);
}
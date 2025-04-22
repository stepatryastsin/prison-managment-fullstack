package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Prisoner;
import java.util.List;
import java.util.Optional;

public interface PrisonerService {
    List<Prisoner> getAllPrisoners();
    Prisoner findById(Integer id);
    Prisoner createPrisoner(Prisoner prisoner);
    Prisoner updatePrisoner(Integer id, Prisoner prisoner);
    void deletePrisoner(Integer id);
    boolean existsPrisonerInCell(Integer cellId);
}
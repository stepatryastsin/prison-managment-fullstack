package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Infirmary;
import java.util.List;
import java.util.Optional;

public interface InfirmaryService {
    List<Infirmary> getAllInfirmaries();
    Optional<Infirmary> getPrisonerFromInfirmaryById(Integer id);
    Infirmary createInfirmary(Infirmary infirmary);
    Infirmary updateInfirmary(Integer id, Infirmary infirmary);
    void deleteInfirmary(Integer id);
}
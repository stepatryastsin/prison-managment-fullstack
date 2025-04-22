package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Infirmary;
import java.util.List;
import java.util.Optional;

public interface InfirmaryService {
    List<Infirmary> getAllInfirmaries();
    Infirmary getById(Long id);
    Infirmary createInfirmary(Infirmary infirmary);
    Infirmary updateInfirmary(Long id, Infirmary infirmary);
    void deleteInfirmary(Long id);
}
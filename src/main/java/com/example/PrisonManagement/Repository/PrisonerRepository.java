package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Prisoner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrisonerRepository
       extends JpaRepository<Prisoner, Integer> {
    boolean existsByCell_CellNum(Integer cellId);
    Optional<Prisoner> findByPrisonerId(Integer id);
    boolean existsByPrisonerId(Integer id);
    void deleteByPrisonerId(Integer id);
}
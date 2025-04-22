package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Entity.Prisoner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


public interface PrisonerRepository extends JpaRepository<Prisoner, Integer> {
    boolean existsByCell_CellNum(Integer cellId);
}
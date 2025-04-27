package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.Infirmary;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InfirmaryRepository extends JpaRepository<Infirmary, Integer> {

    Optional<Infirmary> findByPrisoner_PrisonerId(Integer prisonerId);

    boolean existsByPrisoner_PrisonerId(Integer prisonerId);

    @Modifying
    @Transactional
    void deleteByPrisoner_PrisonerId(Integer prisonerId);
}
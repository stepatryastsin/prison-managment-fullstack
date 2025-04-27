package com.example.PrisonManagement.Repository;


import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertiesInCellsRepository
       extends JpaRepository<PropertiesInCells, PropertiesInCellsKey> {
}
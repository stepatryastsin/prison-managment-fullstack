package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.PropertiesInCells;
import com.example.PrisonManagement.Entity.PropertiesInCellsKey;

import java.util.List;

public interface PropertiesInCellsService {
    List<PropertiesInCells> findAll();
    PropertiesInCells findById(PropertiesInCellsKey id);
    PropertiesInCells save(PropertiesInCells properties);
    void delete(PropertiesInCellsKey id);
}
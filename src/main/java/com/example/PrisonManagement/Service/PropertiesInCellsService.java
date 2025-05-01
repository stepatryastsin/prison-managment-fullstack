package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;

import java.util.List;

public interface PropertiesInCellsService {
    List<PropertiesInCells> findAll();
    PropertiesInCells findById(PropertiesInCellsKey id);
    PropertiesInCells create(PropertiesInCells properties);
    PropertiesInCells update(PropertiesInCellsKey id, PropertiesInCells properties);
    void delete(PropertiesInCellsKey id);
    boolean existsById(PropertiesInCellsKey id);
}
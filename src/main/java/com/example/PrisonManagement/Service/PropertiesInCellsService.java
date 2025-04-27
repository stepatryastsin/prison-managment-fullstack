package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;

import java.util.List;

public interface PropertiesInCellsService {
    List<PropertiesInCells> findAll();
    PropertiesInCells findById(PropertiesInCellsKey id);
    PropertiesInCells save(PropertiesInCells properties);
    void delete(PropertiesInCellsKey id);
}